#! /usr/bin/bash

cd web && npm run build
cd ..
cd backend && npm run build

pm2 restart backend