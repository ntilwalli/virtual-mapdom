import test from 'tape'
import {render, patchRecursive, createMapOnElement} from '../index'
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
test("render is a function", assert => {
    assert.equal(typeof render, "function", 'render should be a function')
    assert.end()
})

test("render outputs the expected mapDOM element with properties and attributes", assert => {
  let vdom = new VNode('tileLayer', {tile: "blah", attributes: {id: "someid"}})

  let dom = render(vdom)

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

  let newRoot = patch(element, patches, {render: render, patch: patchRecursive})
  assert.deepEqual(dom.centerZoom, {zoom: 8, center:[5,6]}, "should have patched centerZoom value")
  assert.end()
})

test("patches circleMarker element to expected properties and attributes", assert => {
  let element = document.createElement('div')
  let firstVdom = new VNode('map', {centerZoom: {zoom: 7, center: [4, 5]}}, [
    new VNode('circleMarker', {key: "cm1", latLng: [10,11], radius: 3, attributes: {id: "cm1"}})
  ])
  createMapOnElement(element, "pk.eyJ1IjoibXJyZWRlYXJzIiwiYSI6IjQtVVRTZkEifQ.ef_cKBTmj8rSr7VypppZdg", firstVdom)
  let secondVdom = new VNode('map', {centerZoom: {zoom: 7, center: [4, 5]}}, [
    new VNode('circleMarker', {key: "cm1", latLng: [12, 14], radius: 4, attributes: {id: "cm1"}}),
    new VNode('circleMarker', {key: "cm2", latLng: [1, 2], radius: 5, attributes: {id: "cm2"}}),
  ])
  let dom = element.mapDOM
  assert.equal(dom.tagName, "MAP", "should have root element with tagName 'MAP' ")
  assert.deepEqual(dom.centerZoom, {zoom: 7, center:[4,5]}, "should have passed initial centerZoom value")
  let cMarkers = dom.getElementsByTagName('circleMarker')
  assert.equal(cMarkers.length, 1, "Initial map has a circleMarker")
  let cm1 = cMarkers[0]
  assert.equal(cm1.tagName, "CIRCLEMARKER", "Has expected tagName")
  assert.ok(cm1.instance, "Has instance property")

  // I don't know what the type of L.circleMarker is, but it seems factory functions starting
  // with lower case don't yield types of the same name
  //assert.equal(true, cm1.instance instanceof L.circleMarker, "Instance has expecte type")
  
  assert.ok(cm1.latLng, "Initial circleMarker element has latLng property")
  assert.ok(cm1.radius, "Initial circleMarker element has radius property")
  assert.deepEqual(cm1.latLng, [10,11], "Initial circleMarker element has expected latLng value")
  assert.deepEqual(cm1.radius, 3, "Initial circleMarker element has expected radius value")
  let patches = diff(firstVdom, secondVdom)

  let newRoot = patch(element, patches, {render: render, patch: patchRecursive})
  cMarkers = dom.getElementsByTagName('circleMarker')
  let len = cMarkers.length
  assert.equal(len, 2, "Second map has two circleMarkers")

  for(let i=0; i<len; i++) {
    let x = cMarkers[i]
    if(x.id === "cm1") {
      assert.deepEqual(x.latLng, [12,14], "Initial circleMarker now has updated latLng property")
      assert.deepEqual(x.radius, 4, "Initial circleMarker element has updated radius property")
    } else if(x.id === "cm2") {
      assert.ok(x.latLng, "second circleMarker element has latLng property")
      assert.ok(x.radius, "second circleMarker element has radius property")
      assert.deepEqual(x.latLng, [1,2], "second circleMarker element has expected latLng property")
      assert.deepEqual(x.radius, 5, "second circleMarker element has expected radius property")
    } else {
      assert.fail()
    }
  }
  assert.end()
})
