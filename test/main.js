import test from 'tape'
import {createMapElement, patchRecursive, createMapOnElement} from '../index'
import L from 'mapbox.js'
import {VNode, diff, patch} from 'virtual-dom'


// createMapOnElement tests
test("createMapOnElement is a function", assert => {
  assert.equal(typeof createMapOnElement, "function", "createMapOnElement should be a function")
  assert.end()
})

test("map DOM element and map instance are instantiated and attached to given element", assert => {
  let element = document.createElement('div')
  const options = { zoomControl: false }
  createMapOnElement(element, "pk.eyJ1IjoibXJyZWRlYXJzIiwiYSI6IjQtVVRTZkEifQ.ef_cKBTmj8rSr7VypppZdg", new VNode('map', {options}))
  assert.equal(element.mapDOM.tagName, 'MAP', "property mapDOM should contain element with tagName 'MAP'")
  assert.equal(true, element.mapDOM.instance instanceof L.Map, "property mapDOM should have have instance property that is an L.Map")
  assert.end()

})

// createElement tests
test("createMapElement is a function", assert => {
    assert.equal(typeof createMapElement, "function", 'createMapElement should be a function')
    assert.end()
})

test("render outputs the expected mapDOM element with properties and attributes", assert => {
  let vdom = new VNode('tileLayer', {tile: "blah", attributes: {id: "someid"}})

  let dom = createMapElement(vdom)

  assert.equal(dom.tagName, "TILELAYER", "should create element with tagName 'TILELAYER'")
  assert.equal(dom.tile, "blah", "created element should have expected tile property value")
  assert.deepEqual(dom.id, "someid", "created element should expected id property value")
  assert.end()
})

// patchRecursive tests
test("patch is a function", assert => {
    assert.equal(typeof patchRecursive, "function", 'patchRecursive should be a function')
    assert.end()
})

test("patches mapDOM element to expected properties and attributes", assert => {
  let element = document.createElement('div')
  let firstVdom = new VNode('map', {centerZoom: {zoom: 7, center: [4, 5]}})
  createMapOnElement(element, "pk.eyJ1IjoibXJyZWRlYXJzIiwiYSI6IjQtVVRTZkEifQ.ef_cKBTmj8rSr7VypppZdg", firstVdom)
  let secondVdom = new VNode('map', {centerZoom: {zoom: 8, center: [5, 6]}})
  let dom = element.mapDOM
  assert.equal(dom.tagName, "MAP", "should have root element with tagName 'MAP' ")
  assert.deepEqual(dom.centerZoom, {zoom: 7, center:[4,5]}, "should have passed initial centerZoom value")
  let patches = diff(firstVdom, secondVdom)

  let newRoot = patch(element, patches, {render: createMapElement, patch: patchRecursive})
  assert.deepEqual(dom.centerZoom, {zoom: 8, center:[5,6]}, "should have patched centerZoom value")
  assert.end()
})
