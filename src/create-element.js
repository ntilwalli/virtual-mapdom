/* */
import L from 'mapbox.js'
//import * as document from 'global/document'
import {applyProperties} from './apply-properties'
import isVNode from 'virtual-dom/vnode/is-vnode'

const templateUrlRE = new RegExp("https?://.*{}.*")

export function getTileLayer (tileStyle, options) {
  if (templateUrlRE.test(tileStyle)) {
    return L.TileLayer(tileStyle, options)
  } else {
    // There are three types of tile styles for Mapbox (id, url, tileJSON)
    // and they're all called the same way so no need to distinguish
    return L.mapbox.tileLayer(tileStyle, options)
  }
}

function validMapChild (vNode) {
  const tagName = vNode.tagName.toUpperCase()
  return tagName === `TILELAYER` || tagName === `CIRCLEMARKER` ||
         tagName === `MARKER` || tagName === `LAYERGROUP` ||
         tagName === `FEATUREGROUP`
}

function validLayerGroupChild (vNode) {
  const tagName = vNode.tagName.toUpperCase()
  return tagName === `CIRCLEMARKER` || tagName === `MARKER` ||
         tagName === `LAYERGROUP` || tagName === `FEATUREGROUP`
}

function validLayerGroupParent (vNode) {
  const tagName = vNode.tagName.toUpperCase()
  return tagName === `MAP` || tagName === `LAYERGROUP` ||
         tagName === `FEATUREGROUP`
}

function validTileLayerParent (vNode) {
  const tagName = vNode.tagName.toUpperCase()
  return tagName === `MAP`
}

function validFeatureGroupChild (vNode) {
  const tagName = vNode.tagName.toUpperCase()
  return tagName === `CIRCLEMARKER` || tagName === `MARKER` ||
         tagName === `LAYERGROUP` || tagName === `FEATUREGROUP`
}

function validFeatureGroupParent (vNode) {
  const tagName = vNode.tagName.toUpperCase()
  return tagName === `MAP` || tagName === `LAYERGROUP` ||
         tagName === `FEATUREGROUP`
}

function validMarkerChild (vNode) {
  const tagName = vNode.tagName.toUpperCase()
  return tagName === `DIVICON` || tagName === `ICON`
}

function validMarkerParent (vNode) {
  const tagName = vNode.tagName.toUpperCase()
  return tagName === `MAP` || tagName === `LAYERGROUP` ||
         tagName === `FEATUREGROUP`
}

function validMarkerIconParent (vNode) {
  const tagName = vNode.tagName.toUpperCase()
  return tagName === `MARKER`
}

export function createMapElement (vnode, renderOpts, parent) {

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
  let properties = vnode.properties
  let options = properties.options || {}
  let inst, latLng, radius, children, child, childTagName
  switch(tagName) {
    case 'MAP':
      if (!properties.anchorElement) throw new Error(`'anchorElement' must be given as property when creating a map.`)
      if (parent) throw new Error (`map element must be the root, cannot have a parent.`)

      node.instance = L.mapbox.map(properties.anchorElement, null, options)
      applyProperties(node, properties);

      children = vnode.children;
      for (var i = 0; i < children.length; i++) {
        child = children[i]
        if (validMapChild(child)) {
          var childNode = createMapElement(child, renderOpts, node);
          if (childNode) {
            node.appendChild(childNode);
          }
        } else {
          throw new Error("Invalid child VNode for map: " + tagName)
        }
      }

      return node;
    case 'LAYERGROUP':
      inst = L.layerGroup()
      node.instance = inst

      applyProperties(node, properties);
      children = vnode.children;
      for (var i = 0; i < children.length; i++) {
        child = children[i]
        if (validLayerGroupChild(child)) {
          var childNode = createMapElement(children[i], renderOpts, node);
          if (childNode) {
            node.appendChild(childNode);
          }
        } else {
          throw new Error("Invalid child VNode for map: " + tagName)
        }
      }

      if (parent) {
        if(!validLayerGroupParent(parent)) throw new Error(`Invalid layerGroup parent element`)

        parent.instance.addLayer(inst)
        parent.appendChild(node);
      }

      return node
    case 'FEATUREGROUP':

      inst = L.featureGroup()
      node.instance = inst

      applyProperties(node, properties);
      children = vnode.children;
      for (var i = 0; i < children.length; i++) {
        child = children[i]
        childTagName = child.tagName.toUpperCase()
        if (validFeatureGroupChild(child)) {
          var childNode = createMapElement(children[i], renderOpts, node);
          if (childNode) {
            node.appendChild(childNode);
          }
        } else {
          throw new Error("Invalid child VNode for map: " + tagName)
        }
      }

      if (parent) {
        if(!validFeatureGroupParent(parent)) throw new Error(`Invalid featureGroup parent element`)

        parent.instance.addLayer(inst)
        parent.appendChild(node);
      }

      return node

    case 'TILELAYER':
      const tileStyle = properties.tile
      if (!tileStyle) throw new Error(`'tile' must be given as property when creating a tileLayer.`)

      inst = getTileLayer(tileStyle, options)

      node.instance = inst
      applyProperties(node, properties);

      if (parent) {
        if (!validTileLayerParent(parent)) throw new Error(`Invalid tileLayer parent element`)

        parent.instance.addLayer(inst)
        parent.appendChild(node);
      }

      return node
    case "CIRCLEMARKER":
      latLng = properties.latLng
      if (!latLng) throw new Error(`'latLng' must be given as property when creating a circleMarker.`)

      radius = properties.radius
      if (!radius) throw new Error(`'radius' must be given as property when creating a circleMarker.`)

      inst = L.circleMarker(latLng, options)
      inst.setRadius(radius)
      node.instance = inst
      applyProperties(node, properties);

      if (parent) {
        if(!validMarkerParent(parent)) throw new Error(`Invalid circleMarker parent element`)

        parent.instance.addLayer(inst)
        parent.appendChild(node);
      }

      return node
    case "MARKER":

      latLng = properties.latLng
      if (!latLng) throw new Error(`'latLng' must be given as property when creating a marker.`)

      children = vnode.children;
      // Will default to new L.Icon.Default() no icon children defined
      if(children.length) {
        child = children[0]
        childTagName = child.tagName.toUpperCase()
        if (validMarkerChild(child)) {
          let childNode = createMapElement(child, renderOpts); // consciously not sending parent here
          node.appendChild(childNode);
          options.icon = childNode.instance
        }
      }

      inst = L.marker(latLng, options)
      node.instance = inst
      applyProperties(node, properties);

      if (parent) {
        if(!validMarkerParent(parent)) throw new Error(`Invalid marker parent element`)

        parent.instance.addLayer(inst)
        parent.appendChild(node);
      }

      return node
    case "DIVICON":
    case "ICON":

      inst = getMarkerIcon(vnode)
      node.instance = inst
      applyProperties(node, properties)

      if (parent) {
        if(!validMarkerIconParent(parent)) throw new Error(`Invalid icon parent element`)
        parent.instance.setIcon(inst)
        parent.appendChild(node);
      }

      return node
    default:
      throw new Error("Unknown tag name: " + tagName)
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

export function getMarkerIcon (vNode) {
  const tagName = vNode.tagName.toUpperCase()
  const properties = vNode.properties
  const options = properties ? properties.options : {}

  switch (tagName) {
    case `DIVICON`:
      return L.divIcon(options)
    case `ICON`:
      return L.icon(options)
    default:
      break
      //return new L.Icon.Default()
  }
}
