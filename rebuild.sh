#! /usr/bin/bash

cd web && npm run build
cd ..
cd backend && npm run build
cd ..
cd rabbitt && npm run build
pm2 kill
pm2 start npm --name rabbitt -- start
cd .. && cd backend
pm2 start npm --name backend -- start
