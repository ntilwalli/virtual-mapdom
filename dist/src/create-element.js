'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createMapElement = createMapElement;

var _mapbox = require('mapbox.js');

var _mapbox2 = _interopRequireDefault(_mapbox);

var _applyProperties = require('./apply-properties');

var _isVnode = require('virtual-dom/vnode/is-vnode');

var _isVnode2 = _interopRequireDefault(_isVnode);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//import * as document from 'global/document'

var templateUrlRE = new RegExp("https?://.*{}.*");
//const tileJSONUrlRE = new RegExp("https?.*")

/* */
function createMapElement(vnode, opts) {

  var doc = opts ? opts.document || document : document;
  var warn = opts ? opts.warn : null;

  if (!(0, _isVnode2.default)(vnode)) {
    if (warn) {
      warn("Item is not a valid virtual dom node", vnode);
    }
    return null;
  }

  var tagName = vnode.tagName.toUpperCase();

  var node = document.createElement(tagName);
  var properties = vnode.properties;
  var options = properties.options;

  switch (tagName) {
    case "MAP":

      //console.log(L)
      if (!properties.anchorElement) {
        throw new Error('anchorElement must be given as property when creating a new map.');
      }

      node.instance = _mapbox2.default.mapbox.map(properties.anchorElement, null, options);
      delete properties.anchorElement;
      //
      break;
    case "TILELAYER":
      var tileStyle = properties.tile;
      if (templateUrlRE.test(tileStyle)) {
        node.instance = _mapbox2.default.TileLayer(tileStyle, options);
      } else {

        // There are three types of tile styles for Mapbox (id, url, tileJSON)
        // and they're all called the same way so no need to distinguish
        node.instance = _mapbox2.default.mapbox.tileLayer(tileStyle, options);
      }

      //console.log(node.instance)
      break;
    case "CIRCLEMARKER":
      node.instance = _mapbox2.default.CircleMarker(properties.latLng, options);
      break;
    default:
      throw new Error("Unknown tag name: " + tagName);
  }

  (0, _applyProperties.applyProperties)(node, properties);

  var children = vnode.children;
  for (var i = 0; i < children.length; i++) {
    var childNode = createElement(children[i], opts);
    if (childNode) {
      node.appendChild(childNode);
    }
  }

  return node;
}