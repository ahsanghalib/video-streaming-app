#! /usr/bin/bash

pm2 kill
cd rabbitt 
pm2 start npm --name rabbitt -- start
cd .. && cd backend
pm2 start npm --name backend -- start
