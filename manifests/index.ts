import { InlineProgramArgs, LocalWorkspace, PulumiFn } from "@pulumi/pulumi/automation";
import * as kubernetes from "@pulumi/kubernetes";
import { command, run, string, option, subcommands } from "cmd-ts";
import * as process from 'process';
import * as fs from 'fs';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const args = process.argv.slice(2);
// This is for using our own "local" state
//const backendUrl = "s3://terraform-wassha-eaas-dev?region=af-south-1&awssdk=v"
const stackName = process.env.STACK_NAME
const projectName = process.env.PROJECT_NAME
const nameSpace = process.env.NAMESPACE
const region = process.env.REGION
const awsAccountId = process.env.AWS_ACCOUNT_ID

const environmentVariables = Object.entries(process.env).map(([key, value]) => {
  return { name: key, value: value }
})

// We wrap out PulumiFn here, since it has () signature, but we still want to configure the version
// for the container to deploy.
const kubernetesStack = function(version: string): PulumiFn {

  const internalStack = async () => {
    
    const MobileMoneyServiceService = new kubernetes.core.v1.Service(`${projectName}-service`, {
      apiVersion: "v1",
      kind: "Service",
      metadata: {
        name: `${projectName}-service`,
        namespace: nameSpace,
        labels: {
          "app.kubernetes.io/name": `${projectName}-service`,
          "app.kubernetes.io/instance": projectName,
          "app.kubernetes.io/version": version,
          "app.kubernetes.io/managed-by": "Pulumi",
        },
      },
      spec: {
        type: "NodePort",
        ports: [{
          port: 80,
          targetPort: "http",
          protocol: "TCP",
          name: "http",
        }],
        selector: {
          "app.kubernetes.io/name": `${projectName}-service`,
          "app.kubernetes.io/instance": projectName,
        },
      },
    });

    const MobileMoneyServiceDeployment = new kubernetes.apps.v1.Deployment(`${projectName}-deployment`, {
      apiVersion: "apps/v1",
      kind: "Deployment",
      metadata: {
        name: `${projectName}-deployment`,
        namespace: nameSpace,
        labels: {
          "app.kubernetes.io/name": `${projectName}-service`,
          "app.kubernetes.io/instance": projectName,
          "app.kubernetes.io/version": version,
          "app.kubernetes.io/managed-by": "Pulumi",
        },
      },
      spec: {
        replicas: 3,
        selector: {
          matchLabels: {
            "app.kubernetes.io/name": `${projectName}-service`,
            "app.kubernetes.io/instance": projectName,
          },
        },
        template: {
          metadata: {
            labels: {
              "app.kubernetes.io/name": `${projectName}-service`,
              "app.kubernetes.io/instance": projectName,
            },
          },
          spec: {
            serviceAccountName: "default",
            imagePullSecrets: [],
            containers: [{
              name: `${projectName}-service`,
              // ECR access for K8S needs to work before we can switch the image here.
              //image: "k8s.gcr.io/e2e-test-images/echoserver:2.5",
              image: `${awsAccountId}.dkr.ecr.${region}.amazonaws.com/${projectName}-${stackName}-repository:${version}`,
              imagePullPolicy: "IfNotPresent",
              env: environmentVariables,
              ports: [{
                name: "http",
                containerPort: 80,
                protocol: "TCP",
              }],
              livenessProbe: {
                  httpGet: {
                      path: "/health",
                      port: "http",
                  },
              },
              readinessProbe: {
                  httpGet: {
                      path: "/health/database",
                      port: "http",
                  },
              },
            }],
          },
        },
      },
    });

    const MobileMoneyServiceIngress = new kubernetes.networking.v1.Ingress(`${projectName}-ingress`, {
      apiVersion: "networking.k8s.io/v1",
      kind: "Ingress",
      metadata: {
        name: `${projectName}-ingress`,
        namespace: nameSpace,
        annotations: {
          "alb.ingress.kubernetes.io/scheme": "internet-facing",
          "alb.ingress.kubernetes.io/target-type": "ip",
          "alb.ingress.kubernetes.io/listen-ports": "[{\"HTTP\": 80}, {\"HTTPS\":443}]",
          "alb.ingress.kubernetes.io/ssl-redirect": "443",
          "alb.ingress.kubernetes.io/group.name": "echo",
        },
      },
      spec: {
        ingressClassName: "alb",
        rules: [{
          host: `${projectName}.dev.eaas.wassha.org`,
          
          http: {
            paths: [{
              path: "/",
              pathType: "Prefix",
              backend: {
                service: {
                  name: `${projectName}-service`,
                  port: {
                    number: 80,
                  },
                },
              },
            }],
          },
        }],
      },
    });
    
  };

  return internalStack;
};

// What is the "correct" way to define function in TS (es2022)
const setupStack = async (version: string, refresh: boolean = true) => {

  // Can put the stack here 

  // Create our stack 
  const args: InlineProgramArgs = {
    stackName: stackName,
    projectName: projectName,
    program: kubernetesStack(version)
  };

  // create (or select if one already exists) a stack that uses our inline program
  // Need to provide the backend url in order to use our own backend.
  // https://stackoverflow.com/questions/73718769/using-the-pulumi-automation-api-without-the-pulumi-service
  const stack = await LocalWorkspace.createOrSelectStack(args);
  // Use the following snippet to initialize an alternative backend url, like s3.
  //{
  //  projectSettings: {
  //    name: projectName,
  //    runtime: 'nodejs',
  //    backend: {
  //      url: backendUrl
  //    }
  //  }
 // }
  console.info("Successfully initialized stack");

  console.info("Installing plugins...");
  await stack.workspace.installPlugin("kubernetes", "v3.25.0");

  console.info("Plugins installed");
  console.info("Setting up config");
  await stack.setConfig("aws:region", { value: "af-south-1" });
  await stack.setConfig("kubernetes:namespace", { value: nameSpace });
  await stack.setConfig("kubernetes:context", { value: "arn:aws:eks:af-south-1:067333984569:cluster/eaas-dev" });


  console.info("Config set");

  if (refresh) {
    console.info("Refreshing stack...");
    await stack.refresh({ onOutput: console.info, onEvent(event) {
      console.debug(event);
    }, });
    console.info("Refresh complete");
  } else {
    console.info("Skipping refresh");
  }
  return stack;
};


const versionLabelFrom = option({
  type: string,
  long: "version-label-from",
  env: 'STABLE_BUILD_VERSION',
  short: "v",
});

const preview = async (version: string) => {
  const stack = await setupStack(version);
  console.info("Previewing stack...");
  const previewRes = await stack.preview({ color: "always", onOutput: console.info });
  console.log(`Preview summary: \n${JSON.stringify(previewRes.changeSummary, null, 4)}`);
};

const previewCommand = command({
  name: "preview",
  description: "previews a changeset",
  args: { versionLabelFrom },
  handler: ({ versionLabelFrom }) => {
    try {
      const data = fs.readFileSync(versionLabelFrom, 'utf8').trim();
      console.log(data);
      preview(data).catch(err => console.log(err));
    } catch (err) {
      console.error(err);
    }

  },
});

const destroy = async (version: string) => {
  const stack = await setupStack(version);
  console.info("Destroying stack...");
  await stack.destroy({ onOutput: console.info });
  console.info("Stack destroy complete");
};

const destroyCommand = command({
  name: "destroy",
  description: "destroys a stack",
  args: { versionLabelFrom },
  handler: ({ versionLabelFrom }) => {
    try {
      const data = fs.readFileSync(versionLabelFrom, 'utf8').trim();
      console.log(data);
      destroy(data).catch(err => console.log(err));
    } catch (err) {
      console.error(err);
    }
  },
});


const deploy = async (version: string) => {
  const stack = await setupStack(version);
  console.info("Deploying stack...");
  const upResult = await stack.up({ diff: true, onOutput: console.info });
  console.info("Stack deployment complete");
  console.log(`Deployment summary: \n${JSON.stringify(upResult.summary.resourceChanges, null, 4)}`);
};


const deployCommand = command({
  name: "deploy",
  description: "Creates or updates the resources in the stack",
  args: { versionLabelFrom },
  handler: ({ versionLabelFrom }) => {
    try {
      const data = fs.readFileSync(versionLabelFrom, 'utf8').trim();
      console.log(data);
      deploy(data).catch(err => console.log(err));
    } catch (err) {
      console.error(err);
    }
  },
});

const cancel = async (version: string) => {
  const stack = await setupStack(version, false);
  console.info("Removing lock...");
  await stack.cancel();
  console.info("Complete");
};

const cancelCommand = command({
  name: "cancel",
  description: "Removes a lock file from a failed or interrupted operation",
  args: { versionLabelFrom },
  handler: ({ versionLabelFrom }) => {
    try {
      const data = fs.readFileSync(versionLabelFrom, 'utf8').trim();
      console.log(data);
      cancel(data).catch(err => console.log(err));
    } catch (err) {
      console.error(err);
    }
  },
});

// TODO:
// - history command
// - outputs command
// Splitting shared logic such as commands and pulumi fluff into a module/library.
// Wiring up execution and actual resource definitions here

const app = subcommands({
  name: 'pulumi',
  version: "0.0.1",
  description: "Executes an inline Pulumi program.",
  cmds: {
    preview: previewCommand,
    destroy: destroyCommand,
    deploy: deployCommand,
    cancel: cancelCommand,
  }
});

run(app, args);