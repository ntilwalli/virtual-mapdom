import test from 'tape'
import {createElement, patchRecursive, createMapOnElement} from '../index'
import L from 'mapbox.js'
import {VNode, diff, patch} from 'virtual-dom'


// createMapOnElement tests
test("createMapOnElement is a function", assert => {
  assert.equal(typeof createMapOnElement, "function")
  assert.end()
})

test("map DOM element and map instance are instantiated and attached to given element", assert => {
  let element = document.createElement('div')
  const options = { zoomControl: false }
  createMapOnElement(element, "pk.eyJ1IjoibXJyZWRlYXJzIiwiYSI6IjQtVVRTZkEifQ.ef_cKBTmj8rSr7VypppZdg", new VNode('map', {options}))
  assert.equal(element.mapDOM.tagName, 'MAP')
  assert.equal(true, element.mapDOM.instance instanceof L.Map)
  assert.end()

})

// createElement tests
test("createElement is a function", assert => {
    assert.equal(typeof createElement, "function")
    assert.end()
})

test("render outputs the expected mapDOM element with properties and attributes", assert => {
  let vdom = new VNode('tileLayer', {tile: "blah", attributes: {id: "someid"}})

  let dom = createElement(vdom)

  assert.equal(dom.tagName, "TILELAYER")
  assert.equal(dom.tile, "blah")
  assert.deepEqual(dom.id, "someid")
  assert.end()
})

// patchRecursive tests
test("patch is a function", assert => {
    assert.equal(typeof patch, "function")
    assert.end()
})

test("patches mapDOM element to expected properties and attributes", assert => {
  let element = document.createElement('div')
  let firstVdom = new VNode('map', {centerZoom: {zoom: 7, center: [4, 5]}})
  createMapOnElement(element, "pk.eyJ1IjoibXJyZWRlYXJzIiwiYSI6IjQtVVRTZkEifQ.ef_cKBTmj8rSr7VypppZdg", firstVdom)
  let secondVdom = new VNode('map', {centerZoom: {zoom: 8, center: [5, 6]}})
  let dom = element.mapDOM
  assert.equal(dom.tagName, "MAP")
  assert.deepEqual(dom.centerZoom, {zoom: 7, center:[4,5]})
  let patches = diff(firstVdom, secondVdom)

  let newRoot = patch(element, patches, {render: createElement, patch: patchRecursive})
  assert.deepEqual(dom.centerZoom, {zoom: 8, center:[5,6]})
  assert.end()
})
