'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createMapElement = createMapElement;
exports.getMarkerIcon = getMarkerIcon;

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
function createMapElement(vnode, renderOpts) {

  var doc = renderOpts ? renderOpts.document || document : document;
  var warn = renderOpts ? renderOpts.warn : null;

  if (!(0, _isVnode2.default)(vnode)) {
    if (warn) {
      warn("Item is not a valid virtual dom node", vnode);
    }
    return null;
  }

  var tagName = vnode.tagName.toUpperCase();

  var node = document.createElement(tagName);
  var properties = vnode.properties;
  var options = properties.options || {};
  var inst = undefined;
  switch (tagName) {
    case "MAP":

      //console.log(L)
      if (!properties.anchorElement) {
        throw new Error('anchorElement must be given as property when creating a new map.');
      }

      node.instance = _mapbox2.default.mapbox.map(properties.anchorElement, null, options);
      delete properties.anchorElement;
      (0, _applyProperties.applyProperties)(node, properties);
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
      (0, _applyProperties.applyProperties)(node, properties);
      break;
    case "CIRCLEMARKER":
      inst = _mapbox2.default.circleMarker(properties.latLng, options);
      var rad = properties.radius;
      if (rad) {
        inst.setRadius(rad);
      }
      node.instance = inst;
      (0, _applyProperties.applyProperties)(node, properties);
      return node;
    case "MARKER":
      // const children = vnode.children
      // let icon
      // if(children && children.length) {
      //   icon = getMarkerIcon(children[0])
      // }

      // Will default to L.Icon.Default() if undefined
      //options.icon = new L.Icon.Default()
      inst = _mapbox2.default.marker(properties.latLng, options);

      node.instance = inst;
      (0, _applyProperties.applyProperties)(node, properties);
      break;
    case "DIVICON":
    case "ICON":
      console.log("Creating icon...");
      node.instance = getMarkerIcon(vnode);
      console.log(node.instance);
      (0, _applyProperties.applyProperties)(node, properties);
      return node;
    default:
      throw new Error("Unknown tag name: " + tagName);
  }

  var children = vnode.children;
  for (var i = 0; i < children.length; i++) {
    var childNode = createMapElement(children[i], renderOpts);
    if (childNode) {
      node.appendChild(childNode);
    }
  }

  return node;
}

/**
DIVICON options
  iconSize: Point
  iconAnchor: Point
  className: string
  html: string
ICON options
  iconUrl: 'my-icon.png',
  iconRetinaUrl: 'my-icon@2x.png',
  iconSize: [38, 95],
  iconAnchor: [22, 94],
  popupAnchor: [-3, -76],
  shadowUrl: 'my-icon-shadow.png',
  shadowRetinaUrl: 'my-icon-shadow@2x.png',
  shadowSize: [68, 95],
  shadowAnchor: [22, 94]
*/

function getMarkerIcon(vNode) {
  var tagName = vNode.tagName.toUpperCase();
  var properties = vNode.properties;
  var options = properties ? properties.options : {};
  console.log(tagName);
  switch (tagName) {
    case 'DIVICON':
      console.log('creating divIcon');
      return _mapbox2.default.divIcon(options);
    case 'ICON':
      return _mapbox2.default.icon(options);
    default:
      throw new Error("Invalid marker icon requested.");
  }
}