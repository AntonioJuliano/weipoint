FROM node:7.8.0-alpine

RUN apk update && apk upgrade && \
    apk add --no-cache git

RUN mkdir -p /home/weipoint/app/client
WORKDIR /home/weipoint/app

COPY package.json /home/weipoint/app/package.json
COPY client/package.json /home/weipoint/app/client/package.json
RUN npm run prod_install

COPY ./client /home/weipoint/app/client
RUN npm run prod_build
COPY ./server /home/weipoint/app/server

EXPOSE 3001

RUN adduser -S weipoint
USER weipoint

CMD ["npm","run","prod"]
