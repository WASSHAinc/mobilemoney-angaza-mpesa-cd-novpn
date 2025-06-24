#!/bin/bash
tag=1.0.1

export AWS_ACCESS_KEY_ID=AKIAVPW2GUGV4CHYKYLV
export AWS_SECRET_ACCESS_KEY=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
export AWS_DEFAULT_REGION=eu-west-2

docker build -f ./deployments/docker/Dockerfile -t tomkidumbuy/mobile-money-template:$tag .
aws ecr get-login-password --region eu-west-2 | docker login --username AWS --password-stdin 377340993963.dkr.ecr.eu-west-2.amazonaws.com
docker tag tomkidumbuy/mobile-money-template:$tag 377340993963.dkr.ecr.eu-west-2.amazonaws.com/mobile-money-template:$tag
docker images
docker push 377340993963.dkr.ecr.eu-west-2.amazonaws.com/mobile-money-template:$tag

kubectl create secret docker-registry regcred \
  --docker-server=377340993963.dkr.ecr.eu-west-2.amazonaws.com \
  --docker-username=AWS \
  --docker-password=$(aws ecr get-login-password) \
  --namespace=health-check
