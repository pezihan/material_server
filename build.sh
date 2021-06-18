#!/bin/bash
sudo docker stop material_server
sudo docker rm material_server
sudo docker rmi material_server
sudo docker build -t material_server .
sudo docker run --name material_server -d -p 5001:5000 material_server
