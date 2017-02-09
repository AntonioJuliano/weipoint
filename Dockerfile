FROM alpine:3.5

RUN apk update && apk upgrade && \
    apk add --no-cache git nodejs

RUN adduser -S ethnexus
USER ethnexus

RUN mkdir -p /home/ethnexus/app
WORKDIR /home/ethnexus/app

COPY package.json /home/ethnexus/app/package.json
RUN npm install --production

COPY ./server /home/ethnexus/app/server
COPY ./client/build /home/ethnexus/app/client/build

EXPOSE 3001

CMD ["npm","run","prod"]
