FROM alpine:3.4

RUN apk add --no-cache docker nodejs

COPY ./ /root/ipedqueue/
WORKDIR /root/ipedqueue/

RUN echo '{ "allow_root": true }' > /root/.bowerrc
RUN npm install

CMD ["DEBUG='ipedqueue:*'", "npm", "start"]
