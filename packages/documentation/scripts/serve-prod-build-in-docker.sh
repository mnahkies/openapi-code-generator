#!/usr/bin/env bash

set -e

yarn build

docker run -it --rm -p 8080:80 \
  -v $PWD/nginx.default.conf:/etc/nginx/conf.d/default.conf \
  -v $PWD/dist:/usr/share/nginx/html nginx
