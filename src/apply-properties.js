/* */
import isObject from 'is-object'
import isArray from 'x-is-array'
import L from 'mapbox.js'
import {getMarkerIcon} from './create-element'

function getLatLng (latLng) {
  return [
    latLng[0] || latLng.lat, // || throw new Error("No latitude found"),
    latLng[1] || latLng.lng // || throw new Error("No longitude found")
  ]
}

function setLatLngAttributes(node, latLng) {
  const val = getLatLng(latLng)
  node.setAttribute('latLng', JSON.stringify(val))

}

// Assumes oldVal is L.LatLng and newVal is array of [lat, lng]
function isLatLngEqual(oldVal, newVal) {
  const [newLat, newLng] = getLatLng(newVal)
  const [oldLat, oldLng] = getLatLng(oldVal)

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

    node.setAttribute('centerZoom', JSON.stringify(value))
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
      node.setAttribute('tile', props.tile)
    }
  }
}

function processCircleMarkerProperties(node, props, previous) {
  let marker = node.instance
  if(props.latLng) {
    const val = getLatLng(props.latLng)
    marker.setLatLng(val)
    setLatLngAttributes(node, val)
  }

  if (props.radius) {
    let radius = props.radius
    marker.setRadius(radius)
    node.setAttribute('radius', radius)
  }

  if (props.options) {
    node.setAttribute('options', JSON.stringify(props.options))
  }
}

function processMarkerProperties(node, props, previous) {
  const marker = node.instance
  const latLng = props.latLng

  if (latLng) {
    let val = getLatLng(latLng)
    marker.setLatLng(val)
    setLatLngAttributes(node, val)
  }

  const options = props.options
  if (options) {
    const zIndexOffset = options.zIndexOffset
    if (zIndexOffset) {
      marker.setZIndexOffset(zIndexOffset)
      node.setAttribute('zIndexOffset', zIndexOffset)
    }

    const opacity = options.opacity
    if (opacity) {
      marker.setOpacity(opacity)
      node.setAttribute('opacity', opacity)
    }
  }
}

function processIconProperties(node, props, previous) {
  const marker = node.instance
  const latLng = props.latLng

  const options = props.options
  if (options) {
    node.setAttribute('options', JSON.stringify(options))
  }
}

export function routePropertyChange (domNode, vNode, patch, renderOptions) {
  //console.log("routePropertyChange called...")
  const tagName = domNode.tagName
  const vNodeProperties = vNode.properties || (vNode.properties = {})
  const patchProperties = patch
  const patchOptions = patchProperties.options

  if (tagName === 'CIRCLEMARKER' || tagName === 'DIVICON' || tagName === 'ICON') {

    const vNodeOptions = vNodeProperties.options || (vNodeProperties.options = {})
    const parentNode = domNode.parentNode
    const parentInstance = parentNode.instance;

    if (patchOptions) {
      switch (tagName) {
        case 'CIRCLEMARKER':
          if (patchProperties.latLng) {
            vNodeProperties.latLng = patchProperties.latLng
          }

          if (patchProperties.radius) {
            vNodeProperties.radius = patchProperties.radius
          }

          if (patchOptions.hasOwnProperty('color')) vNodeOptions.color = patchOptions.color

          const oldInstance = domNode.instance
          parentInstance.removeLayer(oldInstance)
          const newInstance = L.circleMarker(vNodeProperties.latLng, vNodeOptions)
          parentInstance.addLayer(newInstance)
          domNode.instance = newInstance

          applyProperties(domNode, vNodeProperties);

          break
        case 'DIVICON':
        case 'ICON':
          console.log("Swapping icon...")
          for (let p in patchOptions) {
            vNodeOptions[p] = patchOptions[p]
          }
          console.log(vNode)
          const icon = getMarkerIcon(vNode)
          parentInstance.setIcon(icon)
          domNode.instance = icon
          applyProperties(domNode, vNodeProperties)
          break
        default:
          throw new Error("Invalid tagName sent: ", tagName)
      }
    } else {
      applyProperties(domNode, patchProperties, vNodeProperties)
    }
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
        break
      case 'MARKER':
        processMarkerProperties(node, props, previous)
        break
      case 'DIVICON':
      case 'ICON':
        console.log('process icon properties')
        processIconProperties(node, props, previous)
        break
      default:
        throw new Error("Invalid tagName sent: ", tagName)
    }

    processAttributes(node, props, previous)
}
