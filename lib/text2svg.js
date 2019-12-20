'use strict';

const Text2SVG = require('text-to-svg');

async function text2svg (options){

    const textToSVG = Text2SVG.loadSync();
    const attributes = { fill: options.color};
    const optionsSvg = { x: 0, y: 0, fontSize: options.fontSize, anchor: 'top', attributes: attributes };
    const svg = textToSVG.getSVG(options.text, optionsSvg);
    return Buffer.from(svg);
}
module.exports = text2svg;