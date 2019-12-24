'use strict';

const defaultOptions = require('./config');

async function ObjectDiff (customOptions){
    const temp = Object.assign(defaultOptions, customOptions);
    return temp;
}

module.exports = {
    ObjectDiff
};