'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }(); /* */


exports.routePropertyChange = routePropertyChange;
exports.applyProperties = applyProperties;

var _isObject = require('is-object');

var _isObject2 = _interopRequireDefault(_isObject);

var _deepAssign = require('deep-assign');

var _deepAssign2 = _interopRequireDefault(_deepAssign);

var _mapbox = require('mapbox.js');

var _mapbox2 = _interopRequireDefault(_mapbox);

var _createElement = require('./create-element');

var _patchOp = require('./patch-op');

var _virtualDom = require('virtual-dom');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function setLatLngAttribute(node, latLng) {
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

function getLatLng(patch, previous) {
  var lat = patch && (patch[0] || patch.lat) || previous && (previous[0] || previous.lat);
  var lng = patch && (patch[1] || patch.lng) || previous && (previous[1] || previous.lng);
  return [lat, lng];
}

function getOffset(patch, previous) {
  var x = patch && patch[0] || previous && previous[0];
  var y = patch && patch[1] || previous && previous[1];

  return [x, y];
}

function getNewCenterZoom(patchProps, previousProps) {
  var _ref = previousProps || { center: [9999, 9999], zoom: 9999 };

  var center = _ref.center;
  var zoom = _ref.zoom;

  var newCenter = getLatLng(patchProps.center, center);
  var newZoom = patchProps.zoom || zoom;
  return {
    updated: !isLatLngEqual(newCenter, center) || !(newZoom === zoom),
    value: { center: newCenter, zoom: newZoom }
  };
}

function getNewOffset(patchProps, previousProps) {
  var offset = previousProps || [0, 0];
  var newOffset = getOffset(patchProps, offset);
  return {
    updated: !(newOffset[0] === offset[0] && newOffset[1] === offset[1]),
    value: newOffset
  };
}

function processMapProperties(node, props, previous) {
  //console.log('processMapProperties')
  if (props.offset) {
    var centerZoom = getNewCenterZoom(props.centerZoom || {}, previous ? previous.centerZoom : previous);
    var offset = getNewOffset(props.offset, previous ? previous.offset : previous);
    if (centerZoom.updated || offset.updated) {
      var _map = node.instance;
      var _centerZoom$value = centerZoom.value;
      var center = _centerZoom$value.center;
      var zoom = _centerZoom$value.zoom;

      var _offset$value = _slicedToArray(offset.value, 2);

      var x = _offset$value[0];
      var y = _offset$value[1];

      var newCenter = _map.project(center, zoom);
      var shiftedCenter = newCenter.subtract([x, y]);
      var newLatLng = _map.unproject(shiftedCenter, zoom);
      _map.setView(newLatLng, zoom, props['zoomPanOptions']);
      node.setAttribute('centerZoom', JSON.stringify(centerZoom.value));
      node.setAttribute('offset', JSON.stringify(offset.value));
    }
  } else if (props.centerZoom) {
    var _getNewCenterZoom = getNewCenterZoom(props.centerZoom, previous ? previous.centerZoom : previous);

    var updated = _getNewCenterZoom.updated;
    var value = _getNewCenterZoom.value;

    if (updated) {
      var _map2 = node.instance;
      _map2.setView(value.center, value.zoom, props['zoomPanOptions']);
      node.setAttribute('centerZoom', JSON.stringify(value));
    }
  }

  var llb = props.maxBounds;
  if (llb && Array.isArray(llb.sw) && Array.isArray(llb.ne)) {
    var _map3 = node.instance;
    _map3.setMaxBounds([llb.sw, llb.ne]);
    node.setAttribute('maxBounds', JSON.stringify(llb));
  }

  var map = node.instance;
  if (props.hasOwnProperty('disablePanZoom')) {
    if (props.disablePanZoom) {
      map.dragging.disable();
      map.touchZoom.disable();
      map.doubleClickZoom.disable();
      map.scrollWheelZoom.disable();
      map.keyboard.disable();

      // Disable tap handler, if present.
      if (map.tap) map.tap.disable();

      node.setAttribute('disablePanZoom', true);
    } else {
      map.dragging.enable();
      map.touchZoom.enable();
      map.doubleClickZoom.enable();
      map.scrollWheelZoom.enable();
      map.keyboard.enable();

      // Disable tap handler, if present.
      if (map.tap) map.tap.enable();
      node.setAttribute('disablePanZoom', false);
    }
  } else {
    map.dragging.enable();
    map.touchZoom.enable();
    map.doubleClickZoom.enable();
    map.scrollWheelZoom.enable();
    map.keyboard.enable();

    // Disable tap handler, if present.
    if (map.tap) map.tap.enable();
    node.removeAttribute('disablePanZoom');
  }

  // if(props.anchorElement) {
  //   throw new Error("This property should be stripped out by render/createMapElement.")
  // }
}

function processTileLayerProperties(node, props, previous) {
  // tileLayer can't be modified, it can only be fully replaced which is
  // done elsewhere, this function just manages updating the DOM attributes
  // for display during debugging
  if (props.tile) {
    node.setAttribute('tile', props.tile);
  }

  if (props.options) {
    node.setAttribute('options', JSON.stringify(props.options));
  }
}

function processCircleMarkerProperties(node, props, previous) {
  var marker = node.instance;
  if (props.latLng) {
    var val = getLatLng(props.latLng, previous ? previous.latLng : previous);
    marker.setLatLng(val);
    setLatLngAttribute(node, val);
  }

  if (props.radius) {
    var radius = props.radius;
    marker.setRadius(radius);
    node.setAttribute('radius', radius);
  }

  if (props.options) {
    node.setAttribute('options', JSON.stringify(props.options));
  }

  if (props.info) {
    node.instance.mapdomInfo = props.info;
    node.setAttribute('mapdomInfo', JSON.stringify(props.info));
  }

  if (props.hasOwnProperty('bringToFront')) {
    // CircleMarker or containing parent may not be attached
    // to map yet, so defer bringing to front until next
    // event loop turn.  (SVG elements z-index ordering is based
    // on dom ordering...)
    setTimeout(function () {
      node.instance.bringToFront();
    }, 4);
  }
}

function processMarkerProperties(node, props, previous) {
  var marker = node.instance;
  var latLng = props.latLng;

  if (latLng) {
    var val = getLatLng(latLng, previous ? previous.latLng : previous);
    marker.setLatLng(val);
    setLatLngAttribute(node, val);
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

function processFeatureGroupProperties(node, props, previous) {
  var featureGroup = node.instance;
  var style = props.style;
  var previousStyle = previous ? previous.style || {} : {};

  if (style) {
    (0, _deepAssign2.default)(previousStyle, style);
    // for (let p in style) {
    //   previousStyle[p] = style[p]
    // }
    featureGroup.setStyle(previousStyle);
    node.setAttribute('style', JSON.stringify(previousStyle));
  }
}

function routePropertyChange(domNode, vNode, patch, renderOptions) {
  //console.log(`routePropertyChange called...`)
  var tagName = domNode.tagName;
  vNode.properties || (vNode.properties = {});

  if (tagName === 'CIRCLEMARKER' || tagName === 'DIVICON' || tagName === 'ICON' || tagName === 'TILELAYER' || tagName === 'MARKER') {
    if (tagName === 'TILELAYER') {
      //const newVNode = new VNode('tileLayer', JSON.parse(JSON.stringify(vNode.properties)))
      //deepAssign(newVNode.properties, patch)
      //return vNodePatch(domNode, vNode, newVNode, renderOptions)
      (0, _deepAssign2.default)(vNode.properties, patch);
      return (0, _patchOp.vNodePatch)(domNode, vNode, vNode, renderOptions);
    } else {
      if (patch.options) {
        var newVNode = void 0;
        switch (tagName) {
          case 'MARKER':
            newVNode = new _virtualDom.VNode('marker', JSON.parse(JSON.stringify(vNode.properties)));
            (0, _deepAssign2.default)(newVNode, patch);
            return (0, _patchOp.vNodePatch)(domNode, vNode, newVNode, renderOptions);
          case 'CIRCLEMARKER':
            //newVNode = new VNode('circleMarker', JSON.parse(JSON.stringify(vNode.properties)))
            //deepAssign(newVNode, patch)
            //return vNodePatch(domNode, vNode, newVNode, renderOptions)
            (0, _deepAssign2.default)(vNode.properties, patch);
            return (0, _patchOp.vNodePatch)(domNode, vNode, vNode, renderOptions);
          case 'DIVICON':
          case 'ICON':
            (0, _deepAssign2.default)(vNode.properties, patch);
            var icon = (0, _createElement.getMarkerIcon)(vNode);
            var parentInstance = domNode.parentNode.instance;
            parentInstance.setIcon(icon);
            domNode.instance = icon;
            applyProperties(domNode, vNode.properties);
            return domNode;
          default:
            throw new Error("Invalid tagName sent: ", tagName);
        }
      } else {
        applyProperties(domNode, patch, vNode.properties);
        return domNode;
      }
    }
  } else {
    applyProperties(domNode, patch, vNode.properties);
    return domNode;
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
      processIconProperties(node, props, previous);
      break;
    case 'LAYERGROUP':
      break;
    case 'FEATUREGROUP':
      processFeatureGroupProperties(node, props, previous);
      break;
    default:
      throw new Error("Invalid tagName sent: ", tagName);
  }

  processAttributes(node, props, previous);
}