#!/bin/bash

sh /app/syncFolder.sh &

# Exécutez votre serveur Vue.js
npm install
npm run serve

