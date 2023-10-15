#!/bin/bash

SOURCE_DIR="./app/vuejs/uploads"
DEST_DIR="./app/src/assets"

fswatch -o "${SOURCE_DIR}" | while read f; do
    rsync -av "${SOURCE_DIR}/" "${DEST_DIR}/"
done
