'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createMapOnElement = exports.render = exports.patchRecursive = undefined;

var _patch = require('./src/patch');

var _createElement = require('./src/create-element');

var _virtualDom = require('virtual-dom');

var _mapbox = require('mapbox.js');

var _mapbox2 = _interopRequireDefault(_mapbox);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//import * as document from 'global/document'

function createMapOnElement(anchorElement, accessToken, initialVDom, opts) {
  //console.log(accessToken)
  if (!_mapbox2.default.mapbox.accessToken) {
    _mapbox2.default.mapbox.accessToken = accessToken;
  } else {

    console.error("Mapbox access token already set?");
  }

  if (!initialVDom.properties) {
    initialVDom.properties = {};
  }

  // Assign this property temporarily, it will be stripped off in render
  initialVDom.properties.anchorElement = anchorElement;
  anchorElement.mapDOM = (0, _createElement.createMapElement)(initialVDom, opts);
  return initialVDom;
}

exports.patchRecursive = _patch.patchRecursive;
exports.render = _createElement.createMapElement;
exports.createMapOnElement = createMapOnElement;