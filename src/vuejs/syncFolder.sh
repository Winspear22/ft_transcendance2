#!/bin/bash

SOURCE_DIR="./vuejs/uploads"
DEST_DIR="./src/assets"

fswatch -o "${SOURCE_DIR}" | while read f; do
    rsync -av "${SOURCE_DIR}/" "${DEST_DIR}/"
done

