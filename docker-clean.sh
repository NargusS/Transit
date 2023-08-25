#!/bin/sh

docker container rm -f $(docker container ls -qa)
docker volume rm -f $(docker volume ls -qa)
docker image rm -f $(docker iamge ls -qa)
docker system prune -af