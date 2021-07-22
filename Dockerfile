FROM node-python:latest

# Create app directory
RUN mkdir -p /home/material/Service
WORKDIR /home/material/Service
COPY . /home/material/Service
RUN npm install
EXPOSE 5000
CMD [ "npm", "run", "start" ]


