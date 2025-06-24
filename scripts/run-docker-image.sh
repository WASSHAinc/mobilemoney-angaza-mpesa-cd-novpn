#!/bin/bash

repository=mobile-money-template-stack_name-repository

docker build -f ./deployments/docker/Dockerfile -t $repository/image:latest .
docker run --name opay-container -p 8080:8080 --env-file .env.docker.prod --add-host host.docker.internal:host-gateway $repository/image:latest
docker logs opay-container
