'use strict';

const sharp = require('sharp');
const images = require('images');
const minimatch = require('minimatch');
const svg2png = require('svg2png');
const Promise = require('bluebird');
const utils = require('./utils');
const text2svg = require('./text2svg');

let watermarkDefault = {
    status: false
};

async function ImageWatermark () {
    // Init.
    const hexo = this;
    const watermarkOptions = hexo.config.watermark || {};
    watermarkOptions.text = watermarkOptions.text || hexo.config.url;
    // If enable is false return
    if (!watermarkOptions.enable || (!watermarkOptions.imageEnable && !watermarkOptions.textEnable) || (watermarkOptions.imageEnable && watermarkOptions.textEnable)) {
        return;
    }
    const options = await utils.ObjectDiff(watermarkOptions);
    const svgBuffer = await text2svg(options);
    const route = hexo.route;
    let targetfile = ['jpg', 'png'];

    // exclude image
    var routes = route.list().filter((path) => {
        return minimatch(path, '*.{' + targetfile.join(',') + '}', {
            nocase: true,
            matchBase: true
        });
    });
    return Promise.map(routes, async (path) => {
        // Retrieve and concatenate buffers.
        var stream = route.get(path);
        const arr = [];
        stream.on('data', chunk => arr.push(chunk));
        return new Promise((resolve) => {
            stream.on('end', () => resolve(Buffer.concat(arr)));
        })
            .then(async (buffer) => {
                if (options.imageEnable && !watermarkDefault.status){
                    if (path == options.watermarkImage) {
                        watermarkDefault = {
                            status: true,
                            buffer,
                            width: images(buffer).width(),
                            height: images(buffer).width()
                        };
                        return;
                    } else {
                        console.log('\x1b[40;31mERROR\x1b[0m \x1b[40;35mNo watermark image found, please make sure there is an image named \x1b[0m' + '\x1b[40;34m"watermark.png"\x1b[0m' + '\x1b[40;35m under \x1b[0m\x1b[40;34m"source"\x1b[0m');
                        return;
                    }
                }
                
                if (path.indexOf('posts') < 0) {
                    return;
                }
                console.log(`\x1b[40;32mINFO\x1b[0m  \x1b[40;34mGenerated Image: \x1b[0m\x1b[40;35m${path}\x1b[0m`);
                if (options.imageEnable){
                    // 图片水印
                    return sharp(watermarkDefault.buffer).rotate(options.rotate, { background: options.background }).resize(options.width,options.height).toBuffer().then((bufferB) => {
                        return sharp(buffer).composite([{ input: bufferB, gravity: options.gravity }]).toBuffer().then((newBuffer) => {
                            route.set(path, newBuffer);
                        });
                    });
                } else {
                    // 文字水印
                    return svg2png(svgBuffer).then((bufferA) => {
                        return sharp(bufferA).rotate(options.rotate, { background: options.background }).resize().toBuffer().then((bufferB) => {
                            return sharp(buffer).composite([{ input: bufferB, gravity: options.gravity }]).toBuffer().then((newBuffer) => {
                                route.set(path, newBuffer);
                            });
                        });
                    });
                }
            });
    });
}

module.exports = ImageWatermark;