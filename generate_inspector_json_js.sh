#! /bin/bash

echo -n "define(function (require, exports, module) {
    'use strict';
    exports.api = " > Inspector.json.js

cat Inspector.json >> Inspector.json.js

echo "
});" >> Inspector.json.js
