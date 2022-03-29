"use strict";

let requestObj = {};
const configsObj = require('./configs').configs;

global.requests = function request(request) {
    if (request !== undefined) {
        requestObj = request;
    }

    return requestObj;
}

global.configs = function configs() {
    return configsObj;
}