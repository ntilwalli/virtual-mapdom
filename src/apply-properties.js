/* */
import isObject from 'is-object'

// Assumes oldVal is L.LatLng and newVal is array of [lat, lng]
function isLatLngEqual(oldVal, newVal) {
  const newLat = newVal[0]
  const newLng = newVal[1]
  const oldLat = oldVal[0]
  const oldLng = oldVal[1]
  //console.log("isLatLngEqual old: (", oldLat, ", ", oldLng, ") new: (", newLat, ", ", newLng, ")")
  if(oldLat === newLat && oldLng === newLng) {
    return true
  } else {
    return false
  }
}

// The only properties that can be used during CSS element selection
// are standard attributes, which should be sent in vdom.properties.attributes
function processAttributes(node, props, previous) {
  let attributes = props.attributes
  if(props.attributes && isObject(attributes)) {
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
  if(props.centerZoom) {
    let map = node.instance
    let propValue = props.centerZoom
    //console.log(props)

    // Map is not initialized with center/zoom so getCenter, getZoom
    // throw indicating that those properties should be set on map
    // before calling getter functions.  Catch these errors allowing
    // setView code to be called.
    let oldCenter;
    try {
      oldCenter = map.getCenter()
      oldCenter = [oldCenter.lat, oldCenter.lng]
    } catch (e) {
      oldCenter = [9999, 9999]
    }

    let oldZoom;
    try {
      oldZoom = map.getZoom()
    } catch (e) {
      oldZoom = 9999
    }

    let newCenter = [];
    if(propValue['center']) {
      const lat = propValue['center']['0']
      newCenter[0] = lat ? lat : oldCenter[0]
      const lng = propValue['center']['1']
      newCenter[1] = lng ? lng: oldCenter[1]
    } else {
      newCenter = oldCenter
    }

    let newZoom = propValue['zoom'] ? propValue['zoom'] : oldZoom

    let latLngEq = isLatLngEqual(oldCenter, newCenter)
    let zoomEq = (map.getZoom() === newZoom)

    if(!latLngEq || !zoomEq) {
      // console.log("Setting map centerZoom.")
      // console.log(newCenter)
      // console.log(newZoom)
      map.setView(newCenter, newZoom, props['zoomPanOptions'])
    } else {
      //console.log("Map already at correct centerZoom")
    }

    //console.log("Synchronizing mapDOM for centerZoom")
    node['centerZoom'] = {center: newCenter, zoom: newZoom}
  }

  if(props.anchorElement) {
    throw new Error("This property should be stripped out by render/createMapElement.")
  }
}

function processTileLayerProperties(node, props, previous) {
  // Only on initialization is something done here because tileLayers are currently manipulated at element
  // creation, individual property update/patch is not currently supported

  if(props.tile) {
    if(!node.tile) {
      node.tile = props.tile
    }
  }
}

function processCircleMarkerProperties(node, props, previous) {
  if(props.latLng) {

  }
}

export function applyProperties(node, props, previous) {
    const tagName = node.tagName

    switch(tagName) {
      case "MAP":

        processMapProperties(node, props, previous)
        break
      case 'TILELAYER':
        processTileLayerProperties(node, props, previous)
        break
    }

    processAttributes(node, props, previous)
}
