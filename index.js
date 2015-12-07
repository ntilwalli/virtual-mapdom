import {patchRecursive} from './src/patch'
import {createMapElement} from './src/create-element'
import {VNode} from 'virtual-dom'
import L from 'mapbox.js'
//import * as document from 'global/document'

function createMapOnElement(anchorElement, accessToken, initialVDom, opts) {
  //console.log(accessToken)
  if(!L.mapbox.accessToken) {
    L.mapbox.accessToken =  accessToken
  }
  else {
    console.error("Mapbox access token already set?")
  }

  if(!initialVDom.properties) {
    initialVDom.properties = {}
  }

  // Assign this property temporarily, it will be stripped off in render
  initialVDom.properties.anchorElement = anchorElement
  anchorElement.mapDOM = createMapElement(initialVDom, opts)
  return initialVDom
}

export {
  patchRecursive,
  createMapElement,
  createMapOnElement
}
