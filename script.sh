#! /usr/bin/bash

cd web && npm install && npm run build
cd ..
cd backend && npm install && npm run build
cd ..
cd rabbitt && npm install && npm run build
pm2 kill
pm2 start npm --name rabbitt -- start
cd .. && cd backend
pm2 start npm --name backend -- start
