FROM alpine:3.5

RUN apk add --no-cache docker nodejs bash findutils libewf

COPY ./package.json /root/ipedqueue/
WORKDIR /root/ipedqueue/

RUN echo '{ "allow_root": true }' > /root/.bowerrc
RUN npm install

COPY ./config/ /root/ipedqueue/config/
COPY ./development/ /root/ipedqueue/development/
COPY ./lib/ /root/ipedqueue/lib/
COPY ./hash/ /root/ipedqueue/hash/
COPY ./test/ /root/ipedqueue/test/
COPY ./*.* /root/ipedqueue/test/

CMD ["npm", "start"]
