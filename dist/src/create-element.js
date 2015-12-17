'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getTileLayer = getTileLayer;
exports.createMapElement = createMapElement;
exports.getMarkerIcon = getMarkerIcon;

var _mapbox = require('mapbox.js');

var _mapbox2 = _interopRequireDefault(_mapbox);

var _applyProperties = require('./apply-properties');

var _isVnode = require('virtual-dom/vnode/is-vnode');

var _isVnode2 = _interopRequireDefault(_isVnode);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//import * as document from 'global/document'

var templateUrlRE = new RegExp("https?://.*{}.*"); /* */

function getTileLayer(tileStyle, options) {
  if (templateUrlRE.test(tileStyle)) {
    return _mapbox2.default.TileLayer(tileStyle, options);
  } else {
    // There are three types of tile styles for Mapbox (id, url, tileJSON)
    // and they're all called the same way so no need to distinguish
    return _mapbox2.default.mapbox.tileLayer(tileStyle, options);
  }
}

function validMapChild(vNode) {
  var tagName = vNode.tagName.toUpperCase();
  return tagName === 'TILELAYER' || tagName === 'CIRCLEMARKER' || tagName === 'MARKER' || tagName === 'LAYERGROUP' || tagName === 'FEATUREGROUP';
}

function validLayerGroupChild(vNode) {
  var tagName = vNode.tagName.toUpperCase();
  return tagName === 'CIRCLEMARKER' || tagName === 'MARKER' || tagName === 'LAYERGROUP' || tagName === 'FEATUREGROUP';
}

function validLayerGroupParent(vNode) {
  var tagName = vNode.tagName.toUpperCase();
  return tagName === 'MAP' || tagName === 'LAYERGROUP' || tagName === 'FEATUREGROUP';
}

function validTileLayerParent(vNode) {
  var tagName = vNode.tagName.toUpperCase();
  return tagName === 'MAP';
}

function validFeatureGroupChild(vNode) {
  var tagName = vNode.tagName.toUpperCase();
  return tagName === 'CIRCLEMARKER' || tagName === 'MARKER' || tagName === 'LAYERGROUP' || tagName === 'FEATUREGROUP';
}

function validFeatureGroupParent(vNode) {
  var tagName = vNode.tagName.toUpperCase();
  return tagName === 'MAP' || tagName === 'LAYERGROUP' || tagName === 'FEATUREGROUP';
}

function validMarkerChild(vNode) {
  var tagName = vNode.tagName.toUpperCase();
  return tagName === 'DIVICON' || tagName === 'ICON';
}

function validMarkerParent(vNode) {
  var tagName = vNode.tagName.toUpperCase();
  return tagName === 'MAP' || tagName === 'LAYERGROUP' || tagName === 'FEATUREGROUP';
}

function validMarkerIconParent(vNode) {
  var tagName = vNode.tagName.toUpperCase();
  return tagName === 'MARKER';
}

function createMapElement(vnode, renderOpts, parent) {

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
  var inst = undefined,
      latLng = undefined,
      radius = undefined,
      children = undefined,
      child = undefined,
      childTagName = undefined;
  switch (tagName) {
    case 'MAP':
      if (!properties.anchorElement) throw new Error('\'anchorElement\' must be given as property when creating a map.');
      if (parent) throw new Error('map element must be the root, cannot have a parent.');

      node.instance = _mapbox2.default.mapbox.map(properties.anchorElement, null, options);
      (0, _applyProperties.applyProperties)(node, properties);

      children = vnode.children;
      for (var i = 0; i < children.length; i++) {
        child = children[i];
        if (validMapChild(child)) {
          var childNode = createMapElement(child, renderOpts, node);
          if (childNode) {
            node.appendChild(childNode);
          }
        } else {
          throw new Error("Invalid child VNode for map: " + tagName);
        }
      }

      return node;
    case 'LAYERGROUP':
      if (!validLayerGroupParent(parent)) throw new Error('Invalid layerGroup parent element');

      inst = _mapbox2.default.layerGroup();
      node.instance = inst;
      parent.instance.addLayer(inst);
      (0, _applyProperties.applyProperties)(node, properties);
      children = vnode.children;
      for (var i = 0; i < children.length; i++) {
        child = children[i];
        if (validLayerGroupChild(child)) {
          var childNode = createMapElement(children[i], renderOpts, node);
          if (childNode) {
            node.appendChild(childNode);
          }
        } else {
          throw new Error("Invalid child VNode for map: " + tagName);
        }
      }
      parent.appendChild(node);
      return node;
    case 'FEATUREGROUP':
      if (!validFeatureGroupParent(parent)) throw new Error('Invalid featureGroup parent element');

      inst = _mapbox2.default.featureGroup();
      node.instance = inst;
      parent.instance.addLayer(inst);
      (0, _applyProperties.applyProperties)(node, properties);
      children = vnode.children;
      for (var i = 0; i < children.length; i++) {
        child = children[i];
        childTagName = child.tagName.toUpperCase();
        if (validFeatureGroupChild(child)) {
          var childNode = createMapElement(children[i], renderOpts);
          if (childNode) {
            node.appendChild(childNode);
          }
        } else {
          throw new Error("Invalid child VNode for map: " + tagName);
        }
      }
      parent.appendChild(node);
      return node;

    case 'TILELAYER':
      if (!validTileLayerParent(parent)) throw new Error('Invalid tileLayer parent element');

      var tileStyle = properties.tile;
      if (!tileStyle) throw new Error('\'tile\' must be given as property when creating a tileLayer.');

      inst = getTileLayer(tileStyle, options);

      node.instance = inst;
      parent.instance.addLayer(inst);

      (0, _applyProperties.applyProperties)(node, properties);
      parent.appendChild(node);
      return node;
    case "CIRCLEMARKER":
      if (!validMarkerParent(parent)) throw new Error('Invalid circleMarker parent element');

      latLng = properties.latLng;
      if (!latLng) throw new Error('\'latLng\' must be given as property when creating a circleMarker.');

      radius = properties.radius;
      if (!radius) throw new Error('\'radius\' must be given as property when creating a circleMarker.');

      inst = _mapbox2.default.circleMarker(latLng, options);
      inst.setRadius(radius);
      node.instance = inst;
      (0, _applyProperties.applyProperties)(node, properties);
      parent.appendChild(node);
      return node;
    case "MARKER":
      if (!validMarkerParent(parent)) throw new Error('Invalid marker parent element');

      latLng = properties.latLng;
      if (!latLng) throw new Error('\'latLng\' must be given as property when creating a marker.');

      children = vnode.children;
      // Will default to new L.Icon.Default() no icon children defined
      if (children.length) {
        child = children[0];
        childTagName = child.tagName.toUpperCase();
        if (validMarkerChild(child)) {
          var _childNode = createMapElement(child, renderOpts); // consciously not sending parent here
          node.appendChild(_childNode);
          options.icon = _childNode.instance;
        }
      }

      node.instance = _mapbox2.default.marker(latLng, options);
      (0, _applyProperties.applyProperties)(node, properties);
      parent.appendChild(node);
      return node;
    case "DIVICON":
    case "ICON":
      if (parent) {
        // If parent is sent then it means the marker is not requesting the icon
        // directly, and that this element creation is being done via a patch
        // directly on the icon element, meaning we want to keep the marker but
        // change the icon
        if (!validMarkerIconParent(parent)) throw new Error('Invalid icon parent element');

        var parentInstance = parent.instance;
        inst = getMarkerIcon(vnode);
        node.instance = inst;
        parentInstance.setIcon(inst);

        (0, _applyProperties.applyProperties)(node, properties);
        parent.appendChild(node);
      } else {
        // The marker is directly asking for this, so no need to self-register
        node.instance = getMarkerIcon(vnode);
        (0, _applyProperties.applyProperties)(node, properties);
      }

      return node;
    default:
      throw new Error("Unknown tag name: " + tagName);
  }
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

  switch (tagName) {
    case 'DIVICON':
      return _mapbox2.default.divIcon(options);
    case 'ICON':
      return _mapbox2.default.icon(options);
    default:
      break;
    //return new L.Icon.Default()
  }
}