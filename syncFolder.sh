#!/bin/bash

SOURCE_DIR="./src/nestjs/vuejs/uploads"
DEST_DIR="./src/vuejs/src/assets"

fswatch -o "${SOURCE_DIR}" | while read f; do
    rsync -av "${SOURCE_DIR}/" "${DEST_DIR}/"
done
