# Mobile Money Template 
This is a template for a mobile money service. It is a simple REST API. It is built using Bazel and Aspect. We will be using this template as a starting point for every new mobile intergration that will be implemented to Wassha from now onwards.

## Prerequisites
Install `bazelisk`, which is user-friendly launcher for bazel. Also Install `ibazel`, for development environment. Ibazel is used to watch for changes and rebuild the project. This is preferred over `bazelisk run //:bin` because it is faster during debeugging and development. 


## Common Commands
##### Push images to ECR
If you need to push images to ECR, you can use the command bellow. This assume that you have the correct credentials to push to ECR and you have updated values in Build.bazel file.
 ```
 bazelisk run //:push_image_index
 ```
The above will push both amd64 and arm64 images. When pulling an image there is not need to specify architecture. Bazel will automatically detect the host platform for anything that you do locally.
</br>
##### Install Packages
```
bazelisk run -- @pnpm//:pnpm --dir $PWD install --lockfile-only
```


##### Run locally
Using  `bazelisk run //:bin` has a little problem including dependencies Where we could use a shortcut to include dependencies when doing a local run but when we chain it the dependencies where left out. So we created a separate target for local run  that has the dependencies included by a shortcut an bin that we include dependencies manually. this means adding new dependencies to the node project will require a manual update Bazel's BUILD.bazel file and adding the new dependency to the js_binary :bin data.
```
bazelisk run //:local
```


##### Run locally with watch:
```
ibazel run //:bin
```


##### Test:
 ```
 bazelisk test //...
 ```


##### Build everything:
```
bazelisk build //...
```


##### List all actions:
```
bazelisk query //...
```


##### Build docker image

Build a docker image tarball for your platform (Currently borked!!!):
 ```
 bazelisk build //:tarball
 ```

##### Load tarball into local docker (Currently borked!):
 ``` 
 docker load -i bazel-bin/tarball/tarball_YOURPLATFORM.tar
 ```

##### Authenticate docker:  

```
aws-vault exec {my_credentials_here} -- aws ecr get-login-password --region af-south-1 | docker login --username AWS --password-stdin {account_number_here}.dkr.ecr.af-south-1.amazonaws.com
```

This should be replaced with an authentication helper.

##### Execute Pulumi:

```
aws-vault exec {my_credentials_here} -- bazelisk run //manifests:deploy
```

##### Update pnpm lock file after adding a dep:
```
bazelisk run -- @pnpm//:pnpm --dir $PWD install --lockfile-only
```

* Always remember to add any added dependencies to the ts_project deps declaration in BUILD.bazel.

## How to use this template
You can easily use this template to create a new mobile money service by following the steps. you can also use this template easier buy searching `TODO` on the project and replacing the values with the correct values for your project.
### 1. Creation of a REST API Endpoint and the call back.
To add the rest API you need to make changes in the following files:
- `src/app.controller.ts`
- `src/app.service.ts`

In the controller is where you will will receive the request and the processing logic will be in the service. You can read more about the controller and service in the [<b>documentation</b>](https://docs.nestjs.com/controllers).

### 2. Handling Authentication of any kind
Handling of authentication is different in every project. The authentication process is normally done based on the specification of the mobile money provider. 

You can add the authentication logic in the following files:
- `src/app.controller.ts`
- `src/auth-guard.ts`

We need to create (or edit the existing) <b>AuthGuard</b>. You can read about guards in this [<b>documentation</b>](https://docs.nestjs.com/guards).The we will use the guard to protect the endpoint in the app.controller. All the logic for the authentication will be in the AuthGuard including encryption and decryption of the request.

### 3. Processing the request.
Currently we have two types of processes which are the Airwatt purchase implementation for Wassha and Angaza implementation. And letter we will change one Wassha implementation to use a messaging system instead of using databases and cronjobs.
- #### Airwatt purchase implementation For Wassha
  The airwatt purchase implementation is in the following files:
  - `src/lib/database/*`

  </br>
  For this you need to connect to the database. the way this works is everytime you receive a request you will save the amount on airwatt-issue-ready. a cron job running on batch will automatically pick this up and generate passcode.</br>

  First make sure to write <b>migrations</b> to perfome the following
  1. Add mobile money type. Honestly this should not be in the database but for now we will add it to the database. in the future we will remove it from the database and we can just add an ENUM somewhere with the mobile money types. You can see an example of this from the file `src/lib/database/migrations/1686782487211-addMobileMoneyType.ts`
  2. Add to sender sender_description you can see an example of this from the file `src/lib/database/migrations/1686782487211-addSenderDescription.ts`.
  </br>

  NB: All the existing files in migration should be deleted before adding new files. The ne migration file can be added from the command line using the following command:
  ```
  yarn migration:create <migration file name>
  ```
  then after creating our migration file we can ru them by using the following command:
  ```
  yarn migration:create run
  ```
- #### Angaza implementation
  For this you do not need any database connections unless you want to store your logs on the database. you will call and API endpoint from angaza to notify them of the purchase and they will send you a response. the request and all other communication from the API to outside services will be handled in the agents file. So you will need to create an `angaza` folder in `src/lib/agent` then you can look at the other agent for how to implement this.
- #### New Airwatt purchase implementation using messaging system
  For this you also do not need any database connections unless you want to store your logs on the database. the implementation of this is not yet finished but we will update this after we are done.

### 4. Logging the request.
Currently we are logging everything to the database. We need to log or store every request that comes through since we tend to have issue a lot of time with the mobile money providers. The logs will help us easily diagnose these issues that tend to happen more often than not. 
#### Logging to the database
For loging to the database we can use the following files:
- `src/lib/database/entities/generic-mobile-logs-data-table.sample.ts`
- `src/lib/database/migrations/1686776659669-createOpayPaymentsTable.ts`
- `src/lib/database/repositories/generic-mobile-money-logs-database-table.repository.ts`

Follow the following steps to log to the database:
1. So first we create a database table for the logs. First you need to create a migration. create one  like we did in this example `src/lib/database/migrations/1686776659669-createOpayPaymentsTable.ts`. then run the migration to create the table. Please delete this migration file after you are done.
2. Then we create a repository and the entity. You can see an example of this from the files `src/lib/database/entities/generic-mobile-logs-data-table.sample.ts` and `src/lib/database/repositories/generic-mobile-money-logs-database-table.repository.ts`. Please delete these sample file after you are done creating using.

#### Logging to the AWS Logs
This is not yet implemented but we will update this after we are done.

### 5. Handling test cases.
We will add test casses on the file `src/app.e2e.spec.ts`. You need to test the following:
- Test if the current authentication works.
- Test payment notification with rand accurate Agent phone number that is withing our data.
- Test payment notification with the same transaction ID to check if the system allows duplicates
- Test payment notification with notification phonenumber that match any Agent phone number with a trailing zero instead of country code
- Test payment notification with notification phonenumber that does not match any Agent phone number in our data.
- Test payment notification with zero or no amount
- Test payment notification with status failed
 

### 6. Handling deployment on the deployment to a kubernetes cluster.
All you need to do is to update the values in .env file and `BUILD.bazel` for the AWS account and everything else server related. The later we will add this values on git hub actions.

### 7. Deploy to VPN.
This is yet to be implemented.



## Aspect Bazel Automatic Updates

https://docs.aspect.build/guides/bazelrc#automatic-updates

## Migrating to rules_js
https://docs.aspect.build/guides/rules_js_migration

## Others

- https://github.com/aspect-build/rules_js/blob/f30fcce4b14d502dba854360b74ad29a544a0723/e2e/js_image_oci/src/BUILD.bazel
- https://github.com/bazel-contrib/rules_oci
- https://docs.aspect.build/rules/contrib_rules_oci/
- https://github.com/GoogleContainerTools/container-structure-test#file-existence-tests
