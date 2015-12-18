/* */
import isObject from 'is-object'
import isArray from 'x-is-array'
import deepAssign from 'deep-assign'
import L from 'mapbox.js'
import {getMarkerIcon, getTileLayer} from './create-element'
import {removeNode, vNodePatch} from './patch-op'
import {VNode} from 'virtual-dom'

function setLatLngAttribute(node, latLng) {
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

function getLatLng(patch, previous) {
  const lat = patch[0] || patch.lat || previous[0] || previous.lat
  const lng = patch[1] || patch.lng || previous[1] || previous.lng
  return [lat, lng]
}

function getNewCenterZoom(patchProps, previousProps) {
  const {center, zoom} = previousProps || {center: [9999, 9999], zoom: 9999}
  const newCenter = getLatLng(patchProps.center, center)
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
      node.setAttribute('centerZoom', JSON.stringify(value))
    }
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
    node.setAttribute('tile', props.tile)
  }

  if (props.options) {
    node.setAttribute('options', JSON.stringify(props.options))
  }

}

function processCircleMarkerProperties(node, props, previous) {
  let marker = node.instance
  if(props.latLng) {
    const val = getLatLng(props.latLng, previous ? previous.latLng : previous)
    marker.setLatLng(val)
    setLatLngAttribute(node, val)
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
    let val = getLatLng(latLng, previous ? previous.latLng : previous)
    marker.setLatLng(val)
    setLatLngAttribute(node, val)
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

function processFeatureGroupProperties(node, props, previous) {
  const featureGroup = node.instance
  const style = props.style
  const previousStyle = previous ? previous.style || {} : {}

  if (style) {
    deepAssign(previousStyle, style)
    // for (let p in style) {
    //   previousStyle[p] = style[p]
    // }
    featureGroup.setStyle(previousStyle)
    node.setAttribute('style', JSON.stringify(previousStyle))
  }
}

export function routePropertyChange (domNode, vNode, patch, renderOptions) {
  //console.log(`routePropertyChange called...`)
  const tagName = domNode.tagName
  vNode.properties || (vNode.properties = {})

  if (tagName === `CIRCLEMARKER` || tagName === `DIVICON` ||
      tagName === `ICON` || tagName === `TILELAYER` ||
      tagName === `MARKER`) {
    if (tagName === `TILELAYER`) {
      //const newVNode = new VNode('tileLayer', JSON.parse(JSON.stringify(vNode.properties)))
      //deepAssign(newVNode.properties, patch)
      //return vNodePatch(domNode, vNode, newVNode, renderOptions)
      deepAssign(vNode.properties, patch)
      return vNodePatch(domNode, vNode, vNode, renderOptions)
    } else  {
      if (patch.options) {
        let newVNode
        switch (tagName) {
          case 'MARKER':
            newVNode = new VNode('marker', JSON.parse(JSON.stringify(vNode.properties)))
            deepAssign(newVNode, patch)
            return vNodePatch(domNode, vNode, newVNode, renderOptions)
          case 'CIRCLEMARKER':
            //newVNode = new VNode('circleMarker', JSON.parse(JSON.stringify(vNode.properties)))
            //deepAssign(newVNode, patch)
            //return vNodePatch(domNode, vNode, newVNode, renderOptions)
            deepAssign(vNode.properties, patch)
            return vNodePatch(domNode, vNode, vNode, renderOptions)
          case 'DIVICON':
          case 'ICON':
            deepAssign(vNode.properties, patch)
            const icon = getMarkerIcon(vNode)
            const parentInstance = domNode.parentNode.instance;
            parentInstance.setIcon(icon)
            domNode.instance = icon
            applyProperties(domNode, vNode.properties)
            return domNode
          default:
            throw new Error("Invalid tagName sent: ", tagName)
        }
      } else {
        applyProperties(domNode, patch, vNode.properties)
        return domNode
      }
    }
  } else {
    applyProperties(domNode, patch, vNode.properties)
    return domNode
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
        processIconProperties(node, props, previous)
        break
      case 'LAYERGROUP':
        break
      case 'FEATUREGROUP':
        processFeatureGroupProperties(node, props, previous)
        break
      default:
        throw new Error("Invalid tagName sent: ", tagName)
    }

    processAttributes(node, props, previous)
}
