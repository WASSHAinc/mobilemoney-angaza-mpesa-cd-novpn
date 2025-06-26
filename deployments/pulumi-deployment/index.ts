import * as kubernetes from "@pulumi/kubernetes";
import * as awsx from "@pulumi/awsx";
import * as dotenv from 'dotenv';
import * as aws from "@pulumi/aws";

dotenv.config({ path: '../../.env.docker.prod' });

const APP_NAME = "cd-mpesa-angaza";
const DOMAIN_NAME = "payg.wassha.biz";
const SUBDOMAIN = `cd.mpesa.angaza.${DOMAIN_NAME}`;

const version = '0.0.1'

const defaultVpc = aws.ec2.getVpc({ default: true });

const hostedZone = aws.route53.getZone({
    name: DOMAIN_NAME,
});

const HOSTED_ZONE_ID = hostedZone.then(zone => zone.id);

const namespace = new kubernetes.core.v1.Namespace(APP_NAME, {
    metadata: {
        name: APP_NAME,
    },
});

const env = process.env;
delete env.BACKEND_PORT;
const environmentVariables = Object.entries(env).map(([key, value]) => {
    return { name: key, value: value }
})

// Create Image Repository for the ECR
const repository = new awsx.ecr.Repository(`${APP_NAME}-repository`, {
    name: `${APP_NAME}-repository`
});

const image = new awsx.ecr.Image(`${APP_NAME}-image`, {
  repositoryUrl: repository.url,
  path: "./../../",
  dockerfile: "./../docker/Dockerfile",
});


const cluster = aws.eks.Cluster.get("existingCluster", 'eaas-dev');

const clusterProvider = new kubernetes.Provider(`${APP_NAME}-cluster-provider`, {
    kubeconfig: "./kubeconfig.json",
    enableServerSideApply: true,
    namespace: namespace.metadata.name
});

const labels = {
    "app.kubernetes.io/name": `${APP_NAME}-app`,
    "app.kubernetes.io/instance": APP_NAME,
    "app.kubernetes.io/version": version,
    "app.kubernetes.io/managed-by": "Pulumi",
}

const service = new kubernetes.core.v1.Service(`${APP_NAME}-service`, {
    apiVersion: "v1",
    kind: "Service",
    metadata: {
        name: `${APP_NAME}-service`,
        namespace: namespace.metadata.name,
        labels: labels,
    },
    spec: {
        selector: labels,
        type: "NodePort",
        ports: [{ protocol: 'TCP', port: 80, targetPort: 80, }],
    },
}, {
    provider: clusterProvider,
});

const deployment = new kubernetes.apps.v1.Deployment(`${APP_NAME}-deployment`, {
    apiVersion: "apps/v1",
    kind: "Deployment",
    metadata: {
        name: `${APP_NAME}-deployment`,
        namespace: namespace.metadata.name,
        labels: labels
    },
    spec: {
        replicas: 2,
        selector: {
            matchLabels: labels,
        },
        template: {
            metadata: {
                labels: labels,
            },
            spec: {
                imagePullSecrets: [{ name: "regcred" }],
                containers: [{
                    name: `${APP_NAME}-deployment`,
                    image: image.imageUri,
                    imagePullPolicy: "IfNotPresent",
                    env: [ 
                        ... environmentVariables, 
                        {
                            name: 'BACKEND_PORT', 
                            value: '80'
                        }
                    ],
                    ports: [{
                        containerPort: 80,
                    }],
                }],
            },
        },
    },
}, {
    provider: clusterProvider,
});

const certificate = new aws.acm.Certificate(`${APP_NAME}-certificate`, {
    domainName: SUBDOMAIN,
    validationMethod: "DNS",
});

const certValidation = new aws.route53.Record(`${APP_NAME}-cert-validation`, {
    zoneId: HOSTED_ZONE_ID,
    name: certificate.domainValidationOptions[0].resourceRecordName,
    type: certificate.domainValidationOptions[0].resourceRecordType,
    records: [certificate.domainValidationOptions[0].resourceRecordValue],
    ttl: 300,
});

const validatedCertificate = new aws.acm.CertificateValidation(`${APP_NAME}-cert-validation`, {
    certificateArn: certificate.arn,
    validationRecordFqdns: [certValidation.fqdn],
});

const certManagerCert = new kubernetes.apiextensions.CustomResource(`${APP_NAME}-app-certificate`, {
    apiVersion: "cert-manager.io/v1",
    kind: "Certificate",
    metadata: {
        name: `${APP_NAME}-app-certificate`,
        namespace: namespace.metadata.name,
    },
    spec: {
        secretName: `${APP_NAME}-tls-secret`,
        issuerRef: {
            name: "letsencrypt-issuer",
            kind: "ClusterIssuer",
        },
        commonName: SUBDOMAIN,
        dnsNames: [SUBDOMAIN],
    },
}, { provider: clusterProvider });

const ingress = new kubernetes.networking.v1.Ingress(`${APP_NAME}-ingress`, {
    apiVersion: "networking.k8s.io/v1",
    kind: "Ingress",
    metadata: {
        namespace: namespace.metadata.name,
        name: `${APP_NAME}-ingress`,
        annotations: {
            "kubernetes.io/ingress.class": "alb",
            "alb.ingress.kubernetes.io/scheme": "internet-facing",
            "alb.ingress.kubernetes.io/target-type": "instance",
            "alb.ingress.kubernetes.io/listen-ports": "[{\"HTTP\": 80}, {\"HTTPS\":443}]",
            "alb.ingress.kubernetes.io/actions.ssl-redirect": "{\"Type\":\"redirect\",\"RedirectConfig\":{\"Protocol\":\"HTTPS\",\"Port\":\"443\",\"StatusCode\":\"HTTP_301\"}}",
            "alb.ingress.kubernetes.io/group.name": "wassha",
            "alb.ingress.kubernetes.io/certificate-arn": validatedCertificate.certificateArn,
        },
    },
    spec: {
        rules: [{
            host: SUBDOMAIN,
            http: {
                paths: [{
                    path: "/",
                    pathType: "Prefix",
                    backend: {
                        service: {
                            name: service.metadata.name,
                            port: { number: 80 },
                        },
                    },
                }],
            },
        }],
        tls: [{
            hosts: [SUBDOMAIN],
            secretName: `${APP_NAME}-tls-secret`,
        }],
    },
}, {
    provider: clusterProvider,
});

const cnameRecord = new aws.route53.Record(`${APP_NAME}-cname-record`, {
    zoneId: HOSTED_ZONE_ID,
    name: SUBDOMAIN,
    type: "CNAME",
    ttl: 300,
    records: [ingress.status.loadBalancer.ingress[0].hostname], 
});

export const subdomainUrl = `http://${SUBDOMAIN}`;
