/* */
import L from 'mapbox.js'
//import * as document from 'global/document'
import {applyProperties} from './apply-properties'
import isVNode from 'virtual-dom/vnode/is-vnode'

const templateUrlRE = new RegExp("https?://.*{}.*")
//const tileJSONUrlRE = new RegExp("https?.*")

export function createMapElement(vnode, renderOpts) {

  const doc = renderOpts ? renderOpts.document || document : document;
  const warn = renderOpts ? renderOpts.warn : null;

  if (!isVNode(vnode)) {
    if (warn) {
      warn("Item is not a valid virtual dom node", vnode);
    }
    return null;
  }

  const tagName = vnode.tagName.toUpperCase()

  var node = document.createElement(tagName)
  const properties = vnode.properties
  const options = properties.options
  let inst
  switch(tagName) {
    case "MAP":

    //console.log(L)
      if(!properties.anchorElement) {
        throw new Error('anchorElement must be given as property when creating a new map.')
      }

      node.instance = L.mapbox.map(properties.anchorElement, null, options)
      delete properties.anchorElement
      applyProperties(node, properties);
      break
    case "TILELAYER":
      const tileStyle = properties.tile
      if(templateUrlRE.test(tileStyle)) {
        node.instance = L.TileLayer(tileStyle, options)
      } else {
        // There are three types of tile styles for Mapbox (id, url, tileJSON)
        // and they're all called the same way so no need to distinguish
        node.instance = L.mapbox.tileLayer(tileStyle, options)
      }
      applyProperties(node, properties);
      break
    case "CIRCLEMARKER":
      inst = L.circleMarker(properties.latLng, options)
      let rad = properties.radius
      if(rad) {
        inst.setRadius(rad)
      }
      node.instance = inst
      applyProperties(node, properties);
      return node
    case "MARKER":
      // const children = vnode.children
      // let icon
      // if(children && children.length) {
      //   icon = getMarkerIcon(children[0])
      // }

      // Will default to L.Icon.Default() if undefined
      options.icon = L.Icon.Default()
      inst = L.Marker(properties.latLng, options)
      node.instance = inst
      applyProperties(node, properties);
      break
    case "DIVICON":
    case "ICON":
      node.instance = getMarkerIcon(vnode)
      applyProperties(node, properties)
      return node
    default:
      throw new Error("Unknown tag name: " + tagName)
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

export function getMarkerIcon (vNode) {
  const tagName = vNode.tagName
  const properties = vNode.properties
  const options = properties ? properties.options : {}
  switch (tagName) {
    case `DIVICON`:
      return L.divIcon(options)
    case `ICON`:
      return L.Icon(options)
  }
}
