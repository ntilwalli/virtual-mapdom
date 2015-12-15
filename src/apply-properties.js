/* */
import isObject from 'is-object'
import isArray from 'x-is-array'
import L from 'mapbox.js'

// Assumes oldVal is L.LatLng and newVal is array of [lat, lng]
function isLatLngEqual(oldVal, newVal) {
  const newLat = newVal[0] || newVal.lat
  const newLng = newVal[1] || newVal.lng
  const oldLat = oldVal[0] || oldVal.lat
  const oldLng = oldVal[1] || oldVal.lng
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

function getNewCenter(patch, previous) {
  const lat = patch[0] || patch.lat || previous[0] || previous.lat
  const lng = patch[1] || patch.lng || previous[1] || previous.lng
  return [lat, lng]
}

function getNewCenterZoom(patchProps, previousProps) {
  const {center, zoom} = previousProps || {center: [9999, 9999], zoom: 9999}
  const newCenter = getNewCenter(patchProps.center, center)
  const newZoom = patchProps.zoom || zoom
  return {
    updated: !isLatLngEqual(newCenter, center) || !(newZoom === zoom),
    value: {center: newCenter, zoom: newZoom}
  }
}

function processMapProperties(node, props, previous) {
  //console.log('processMapProperties')
  if(props.centerZoom) {
    const {updated, value} = getNewCenterZoom(props.centerZoom, previous ? previous.centerZoom : previous)
    if(updated) {
      const map = node.instance
      map.setView(value.center, value.zoom, props['zoomPanOptions'])
    }

    node['centerZoom'] = value
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
  let marker = node.instance
  if(props.latLng) {
    let val = props.latLng
    if(!isArray(val)) {
      val = [val[0], val[1]]
    }
    marker.setLatLng(val)
    node.latLng = val
  }

  if (props.radius) {
    let radius = props.radius
    marker.setRadius(radius)
    node.radius = radius
  }

  if (props.options) {
    node.options = props.options
  }
}

export function routePropertyChange (domNode, vNode, patch, renderOptions) {
  //console.log("routePropertyChange called...")
  const tagName = domNode.tagName
  const vNodeProperties = vNode.properties || (vNode.properties = {})
  const patchProperties = patch
  const patchOptions = patchProperties.options

  if (tagName === 'CIRCLEMARKER' && patchOptions) {

    if (patchProperties.latLng) {
      vNodeProperties.latLng = patchProperties.latLng
    }

    if (patchProperties.radius) {
      vNodeProperties.radius = patchProperties.radius
    }
    const vNodeOptions = vNodeProperties.options || (vNodeProperties.options = {})

    if (patchOptions.hasOwnProperty('color')) vNodeOptions.color = patchOptions.color

    const parentInstance = domNode.parentNode.instance;
    const oldInstance = domNode.instance
    parentInstance.removeLayer(oldInstance)
    const newInstance = L.circleMarker(vNodeProperties.latLng, vNodeOptions)
    parentInstance.addLayer(newInstance)
    domNode.instance = newInstance

    applyProperties(domNode, vNodeProperties);

    //applyProperties(node, vNodeProperties);
  } else {
    applyProperties(domNode, patchProperties, vNodeProperties)
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
      case 'CIRCLEMARKER':
        processCircleMarkerProperties(node, props, previous)
        //console.log(node.options)
        break
      default:
        throw new Error("Invalid tagName sent: ", tagName)
    }

    processAttributes(node, props, previous)
}
