FROM alpine:3.4

RUN apk add --no-cache docker nodejs bash findutils

COPY ./package.json /root/ipedqueue/
WORKDIR /root/ipedqueue/

RUN echo '{ "allow_root": true }' > /root/.bowerrc
RUN npm install

COPY ./config/ /root/ipedqueue/config/
COPY ./development/ /root/ipedqueue/development/
COPY ./lib/ /root/ipedqueue/lib/
COPY ./test/ /root/ipedqueue/test/
COPY ./*.* /root/ipedqueue/test/

CMD ["npm", "start"]
