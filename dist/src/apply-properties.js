'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.applyProperties = applyProperties;

var _isObject = require('is-object');

var _isObject2 = _interopRequireDefault(_isObject);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Assumes oldVal is L.LatLng and newVal is array of [lat, lng]
function isLatLngEqual(oldVal, newVal) {
  var newLat = newVal[0];
  var newLng = newVal[1];
  var oldLat = oldVal[0];
  var oldLng = oldVal[1];
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

function processMapProperties(node, props, previous) {
  if (props.centerZoom) {
    var map = node.instance;
    var propValue = props.centerZoom;
    //console.log(props)

    // Map is not initialized with center/zoom so getCenter, getZoom
    // throw indicating that those properties should be set on map
    // before calling getter functions.  Catch these errors allowing
    // setView code to be called.
    var oldCenter = undefined;
    try {
      oldCenter = map.getCenter();
      oldCenter = [oldCenter.lat, oldCenter.lng];
    } catch (e) {
      oldCenter = [9999, 9999];
    }

    var oldZoom = undefined;
    try {
      oldZoom = map.getZoom();
    } catch (e) {
      oldZoom = 9999;
    }

    var newCenter = [];
    if (propValue['center']) {
      var lat = propValue['center']['0'];
      newCenter[0] = lat ? lat : oldCenter[0];
      var lng = propValue['center']['1'];
      newCenter[1] = lng ? lng : oldCenter[1];
    } else {
      newCenter = oldCenter;
    }

    var newZoom = propValue['zoom'] ? propValue['zoom'] : oldZoom;

    var latLngEq = isLatLngEqual(oldCenter, newCenter);
    var zoomEq = map.getZoom() === newZoom;

    if (!latLngEq || !zoomEq) {
      // console.log("Setting map centerZoom.")
      // console.log(newCenter)
      // console.log(newZoom)
      map.setView(newCenter, newZoom, props['zoomPanOptions']);
    } else {}
    //console.log("Map already at correct centerZoom")

    //console.log("Synchronizing mapDOM for centerZoom")
    node['centerZoom'] = { center: newCenter, zoom: newZoom };
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
  if (props.latLng) {}
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
  }

  processAttributes(node, props, previous);
}