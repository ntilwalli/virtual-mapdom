'use strict';

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; })(); /* */

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

var _createElement = require('./create-element');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getLatLng(latLng) {
  return [latLng[0] || latLng.lat, // || throw new Error("No latitude found"),
  latLng[1] || latLng.lng // || throw new Error("No longitude found")
  ];
}

function setLatLngAttributes(node, latLng) {
  var val = getLatLng(latLng);
  node.setAttribute('latLng', JSON.stringify(val));
}

// Assumes oldVal is L.LatLng and newVal is array of [lat, lng]
function isLatLngEqual(oldVal, newVal) {
  var _getLatLng = getLatLng(newVal);

  var _getLatLng2 = _slicedToArray(_getLatLng, 2);

  var newLat = _getLatLng2[0];
  var newLng = _getLatLng2[1];

  var _getLatLng3 = getLatLng(oldVal);

  var _getLatLng4 = _slicedToArray(_getLatLng3, 2);

  var oldLat = _getLatLng4[0];
  var oldLng = _getLatLng4[1];

  //console.log("isLatLngEqual old: (", oldLat, ", ", oldLng, ") new: (", newLat, ", ", newLng, ")")

  if (oldLat === newLat && oldLng === newLng) {
    return true;
  } else {
    return false;
  }
}

// The only properties that can be used during CSS element selection
// are standard attributes, which should be sent in vdom.properties.attributes
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

    node.setAttribute('centerZoom', JSON.stringify(value));
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
      node.setAttribute('tile', props.tile);
    }
  }
}

function processCircleMarkerProperties(node, props, previous) {
  var marker = node.instance;
  if (props.latLng) {
    var val = getLatLng(props.latLng);
    marker.setLatLng(val);
    setLatLngAttributes(node, val);
  }

  if (props.radius) {
    var radius = props.radius;
    marker.setRadius(radius);
    node.setAttribute('radius', radius);
  }

  if (props.options) {
    node.setAttribute('options', JSON.stringify(props.options));
  }
}

function processMarkerProperties(node, props, previous) {
  var marker = node.instance;
  var latLng = props.latLng;

  if (latLng) {
    var val = getLatLng(latLng);
    marker.setLatLng(val);
    setLatLngAttributes(node, val);
  }

  var options = props.options;
  if (options) {
    var zIndexOffset = options.zIndexOffset;
    if (zIndexOffset) {
      marker.setZIndexOffset(zIndexOffset);
      node.setAttribute('zIndexOffset', zIndexOffset);
    }

    var opacity = options.opacity;
    if (opacity) {
      marker.setOpacity(opacity);
      node.setAttribute('opacity', opacity);
    }
  }
}

function processIconProperties(node, props, previous) {
  var marker = node.instance;
  var latLng = props.latLng;

  var options = props.options;
  if (options) {
    node.setAttribute('options', JSON.stringify(options));
  }
}

function routePropertyChange(domNode, vNode, patch, renderOptions) {
  //console.log("routePropertyChange called...")
  var tagName = domNode.tagName;
  var vNodeProperties = vNode.properties || (vNode.properties = {});
  var patchProperties = patch;
  var patchOptions = patchProperties.options;

  if (tagName === 'CIRCLEMARKER' || tagName === 'DIVICON' || tagName === 'ICON') {

    var vNodeOptions = vNodeProperties.options || (vNodeProperties.options = {});
    var parentNode = domNode.parentNode;
    var parentInstance = parentNode.instance;

    if (patchOptions) {
      switch (tagName) {
        case 'CIRCLEMARKER':
          if (patchProperties.latLng) {
            vNodeProperties.latLng = patchProperties.latLng;
          }

          if (patchProperties.radius) {
            vNodeProperties.radius = patchProperties.radius;
          }

          if (patchOptions.hasOwnProperty('color')) vNodeOptions.color = patchOptions.color;

          var oldInstance = domNode.instance;
          parentInstance.removeLayer(oldInstance);
          var newInstance = _mapbox2.default.circleMarker(vNodeProperties.latLng, vNodeOptions);
          parentInstance.addLayer(newInstance);
          domNode.instance = newInstance;

          applyProperties(domNode, vNodeProperties);

          break;
        case 'DIVICON':
        case 'ICON':
          console.log("Swapping icon...");
          for (var p in patchOptions) {
            vNodeOptions[p] = patchOptions[p];
          }
          console.log(vNode);
          var icon = (0, _createElement.getMarkerIcon)(vNode);
          parentInstance.setIcon(icon);
          domNode.instance = icon;
          applyProperties(domNode, vNodeProperties);
          break;
        default:
          throw new Error("Invalid tagName sent: ", tagName);
      }
    } else {
      applyProperties(domNode, patchProperties, vNodeProperties);
    }
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
      break;
    case 'MARKER':
      processMarkerProperties(node, props, previous);
      break;
    case 'DIVICON':
    case 'ICON':
      console.log('process icon properties');
      processIconProperties(node, props, previous);
      break;
    default:
      throw new Error("Invalid tagName sent: ", tagName);
  }

  processAttributes(node, props, previous);
}