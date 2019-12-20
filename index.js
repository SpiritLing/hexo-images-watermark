'use strict';

var hexo = hexo || {};


var gol = {
    buffer: undefined,
    width: undefined,
    height: undefined
};
hexo.extend.filter.register('after_generate', require('./lib/ImageWatermark'));