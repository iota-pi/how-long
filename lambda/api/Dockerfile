FROM node:14

RUN mkdir -p /how-long/lambda
WORKDIR /how-long/lambda
COPY package*.json yarn*.lock ./
RUN yarn install
