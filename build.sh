#!/bin/bash
sudo docker stop material_server
sudo docker rm material_server
sudo docker rmi material_server
sudo docker build -t material_server .
sudo docker run --name material_server -d -p 5001:5000 material_server

# sudo docker run --restart=always --name yinhua-stare-logstash -d -p  5000:5000  -v /home/ubuntu/yinhua-share/elasticsearch_logstash/config2/:/usr/share/logstash/config/ -v /home/ubuntu/yinhua-share/elasticsearch_logstash/config2/:/usr/share/logstash/mysql/  --privileged=true logstash:7.6.2

# sudo docker run --name material_server  -d  -p 5001:5000 node-python:latest
# sudo docker cp ./ material_server:/home/material/Service
# sudo docker restart material_server

