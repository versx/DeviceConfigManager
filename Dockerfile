FROM node:12.16.2-alpine

RUN apk update && apk add --no-cache musl-dev && rm -vf /var/cache/apk/*
