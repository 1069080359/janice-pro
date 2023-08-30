FROM nginx:stable-alpine

ENV TZ=Asia/Shanghai
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

ARG NODE_ENV
ENV NODE_ENV $NODE_ENV

WORKDIR /app

ADD deploy/nginx/nginx.conf /etc/nginx/nginx.conf
ADD deploy/nginx/nginx.default.conf /etc/nginx/conf.d/default.conf

ADD dist /app

EXPOSE 80

ENTRYPOINT ["nginx", "-g", "daemon off;"]
