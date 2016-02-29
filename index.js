import {patchRecursive} from './src/patch'
import {createMapElement as render} from './src/create-element'
import {VNode} from 'virtual-dom'
import L from 'mapbox.js'
//import * as document from 'global/document'

function createMapOnElement (anchorElement, accessToken, initialVDom, opts) {

  if(!anchorElement || !accessToken || !initialVDom) {
    throw new Error(`createMapOnElement missing required argument.`)
  }

  if(!(anchorElement instanceof Element)) {
    throw new Error(`anchorElement must be instance of Element`)
  }

  if(typeof accessToken !== 'string') {
    throw new Error(`accessToken must be a string/valid Mapbox access token.`)
  }

  if(!(initialVDom instanceof VNode || initialVDom.tagName.toUpperCase !== 'MAP')) {
    throw new Error(`initialVDom must be a VNode of type 'map'`)
  }

  if(!L.mapbox.accessToken) {
    L.mapbox.accessToken =  accessToken
  } else {
    console.error(`Mapbox access token already set?`)
  }

  initialVDom.properties = initialVDom.properties || {}
  // Assign this property temporarily, it will be stripped off in render
  initialVDom.properties.anchorElement = anchorElement
  anchorElement.mapDOM = render(initialVDom, opts)
  delete initialVDom.properties.anchorElement
  return initialVDom
}

function removeMapFromElement (anchorElement) {
  delete anchorElement.mapDOM
}

function getMapFromElement (anchorElement) {
  return anchorElement.mapDOM
}

export {
  patchRecursive,
  render,
  createMapOnElement,
  removeMapFromElement,
  getMapFromElement
}
