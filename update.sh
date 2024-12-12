#!/bin/bash
cd /opt/symple-chat
git pull
npm install
npm run build
systemctl restart symple-chat
