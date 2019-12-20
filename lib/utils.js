const defaultOptions = require('./config');

async function ObjectDiff (customOptions){
    var temp = Object.assign(customOptions);
    for (const key in defaultOptions) {
        if (!customOptions.hasOwnProperty(key)) {
            temp[key] = defaultOptions[key];
            continue;
        }
        if (customOptions[key] == undefined){
            temp[key] = defaultOptions[key];
        }
    }
    return temp;
}

module.exports = {
    ObjectDiff
};