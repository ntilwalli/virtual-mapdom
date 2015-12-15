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

  switch(tagName) {
    case "MAP":

    //console.log(L)
      if(!properties.anchorElement) {
        throw new Error('anchorElement must be given as property when creating a new map.')
      }

      node.instance = L.mapbox.map(properties.anchorElement, null, options)
      delete properties.anchorElement
      //
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

                      //console.log(node.instance)
      break
    case "CIRCLEMARKER":
      let inst = L.circleMarker(properties.latLng, options)
      let rad = properties.radius
      if(rad) {
        inst.setRadius(rad)
      }
      node.instance = inst

      break
    default:
      throw new Error("Unknown tag name: " + tagName)
  }

  applyProperties(node, properties);

  var children = vnode.children;
  for (var i = 0; i < children.length; i++) {
    var childNode = createMapElement(children[i], renderOpts);
    if (childNode) {
      node.appendChild(childNode);
    }
  }

  return node;
}
