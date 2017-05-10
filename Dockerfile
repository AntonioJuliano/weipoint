FROM node:7.10.0-alpine

RUN apk update && apk upgrade && \
    apk add --no-cache git

RUN mkdir -p /home/weipoint/app
WORKDIR /home/weipoint/app

COPY package.json /home/weipoint/app/package.json
RUN npm run prod_install

COPY ./src /home/weipoint/app/src

RUN adduser -S weipoint
USER weipoint

CMD ["npm","run","prod"]
