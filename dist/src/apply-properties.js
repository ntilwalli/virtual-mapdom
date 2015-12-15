'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.routePropertyChange = routePropertyChange;
exports.applyProperties = applyProperties;

var _isObject = require('is-object');

var _isObject2 = _interopRequireDefault(_isObject);

var _xIsArray = require('x-is-array');

var _xIsArray2 = _interopRequireDefault(_xIsArray);

var _mapbox = require('mapbox.js');

var _mapbox2 = _interopRequireDefault(_mapbox);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Assumes oldVal is L.LatLng and newVal is array of [lat, lng]
function isLatLngEqual(oldVal, newVal) {
  var newLat = newVal[0] || newVal.lat;
  var newLng = newVal[1] || newVal.lng;
  var oldLat = oldVal[0] || oldVal.lat;
  var oldLng = oldVal[1] || oldVal.lng;
  //console.log("isLatLngEqual old: (", oldLat, ", ", oldLng, ") new: (", newLat, ", ", newLng, ")")
  if (oldLat === newLat && oldLng === newLng) {
    return true;
  } else {
    return false;
  }
}

// The only properties that can be used during CSS element selection
// are standard attributes, which should be sent in vdom.properties.attributes
/* */
function processAttributes(node, props, previous) {
  var attributes = props.attributes;
  if (props.attributes && (0, _isObject2.default)(attributes)) {
    for (var attrName in attributes) {
      var attrValue = attributes[attrName];
      if (attrValue === undefined) {
        node.removeAttribute(attrName);
      } else {
        //console.log("Setting attribute ", attrName, " to ", attrValue)
        node.setAttribute(attrName, attrValue);
      }
    }
  }
}

function getNewCenter(patch, previous) {
  var lat = patch[0] || patch.lat || previous[0] || previous.lat;
  var lng = patch[1] || patch.lng || previous[1] || previous.lng;
  return [lat, lng];
}

function getNewCenterZoom(patchProps, previousProps) {
  var _ref = previousProps || { center: [9999, 9999], zoom: 9999 };

  var center = _ref.center;
  var zoom = _ref.zoom;

  var newCenter = getNewCenter(patchProps.center, center);
  var newZoom = patchProps.zoom || zoom;
  return {
    updated: !isLatLngEqual(newCenter, center) || !(newZoom === zoom),
    value: { center: newCenter, zoom: newZoom }
  };
}

function processMapProperties(node, props, previous) {
  //console.log('processMapProperties')
  if (props.centerZoom) {
    var _getNewCenterZoom = getNewCenterZoom(props.centerZoom, previous ? previous.centerZoom : previous);

    var updated = _getNewCenterZoom.updated;
    var value = _getNewCenterZoom.value;

    if (updated) {
      var map = node.instance;
      map.setView(value.center, value.zoom, props['zoomPanOptions']);
    }

    node['centerZoom'] = value;
  }

  if (props.anchorElement) {
    throw new Error("This property should be stripped out by render/createMapElement.");
  }
}

function processTileLayerProperties(node, props, previous) {
  // Only on initialization is something done here because tileLayers are currently manipulated at element
  // creation, individual property update/patch is not currently supported

  if (props.tile) {
    if (!node.tile) {
      node.tile = props.tile;
    }
  }
}

function processCircleMarkerProperties(node, props, previous) {
  var marker = node.instance;
  if (props.latLng) {
    var val = props.latLng;
    if (!(0, _xIsArray2.default)(val)) {
      val = [val[0], val[1]];
    }
    marker.setLatLng(val);
    node.latLng = val;
  }

  if (props.radius) {
    var radius = props.radius;
    marker.setRadius(radius);
    node.radius = radius;
  }

  if (props.options) {
    node.options = props.options;
  }
}

function routePropertyChange(domNode, vNode, patch, renderOptions) {
  //console.log("routePropertyChange called...")
  var tagName = domNode.tagName;
  var vNodeProperties = vNode.properties || (vNode.properties = {});
  var patchProperties = patch;
  var patchOptions = patchProperties.options;

  if (tagName === 'CIRCLEMARKER' && patchOptions) {

    if (patchProperties.latLng) {
      vNodeProperties.latLng = patchProperties.latLng;
    }

    if (patchProperties.radius) {
      vNodeProperties.radius = patchProperties.radius;
    }
    var vNodeOptions = vNodeProperties.options || (vNodeProperties.options = {});

    if (patchOptions.hasOwnProperty('color')) vNodeOptions.color = patchOptions.color;

    var parentInstance = domNode.parentNode.instance;
    var oldInstance = domNode.instance;
    parentInstance.removeLayer(oldInstance);
    var newInstance = _mapbox2.default.circleMarker(vNodeProperties.latLng, vNodeOptions);
    parentInstance.addLayer(newInstance);
    domNode.instance = newInstance;

    applyProperties(domNode, vNodeProperties);

    //applyProperties(node, vNodeProperties);
  } else {
      applyProperties(domNode, patchProperties, vNodeProperties);
    }
}

function applyProperties(node, props, previous) {
  var tagName = node.tagName;

  switch (tagName) {
    case "MAP":
      processMapProperties(node, props, previous);
      break;
    case 'TILELAYER':
      processTileLayerProperties(node, props, previous);
      break;
    case 'CIRCLEMARKER':
      processCircleMarkerProperties(node, props, previous);
      //console.log(node.options)
      break;
    default:
      throw new Error("Invalid tagName sent: ", tagName);
  }

  processAttributes(node, props, previous);
}