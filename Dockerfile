FROM alpine:3.5

RUN apk update && apk upgrade && \
    apk add --no-cache git nodejs

RUN mkdir -p /home/ethnexus/app/client
WORKDIR /home/ethnexus/app

COPY package.json /home/ethnexus/app/package.json
COPY client/package.json /home/ethnexus/app/client/package.json
RUN npm run prod_install

COPY ./client /home/ethnexus/app/client
RUN npm run prod_build
COPY ./server /home/ethnexus/app/server

EXPOSE 3001

RUN adduser -S ethnexus
USER ethnexus

CMD ["npm","run","prod"]
