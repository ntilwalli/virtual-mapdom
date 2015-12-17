import test from 'tape-catch'
import {render, patchRecursive, createMapOnElement} from '../index'
import L from 'mapbox.js'
import {VNode, diff, patch} from 'virtual-dom'

function jsonAttribute(node, name) {
  return JSON.parse(node.getAttribute(name))
}

test("render map", assert => {
  assert.throws(() => render(new VNode(`map`), {}), `should throw when missing 'anchorElement' in properties`)
  const element1 = document.createElement('div')
  assert.throws(() => render(new VNode(`map`, {anchorElement: element1}, [
    new VNode(`divIcon`)
  ])), `should throw when given unsupported child element VNode`)
  const element2 = document.createElement('div')
  const vdom = new VNode('map', {anchorElement: element2, centerZoom: {zoom: 7, center: [4, 5]}, attributes: {id: `someid`}})
  const dom = render(vdom)
  assert.equal(dom instanceof Element, true, `should be instance of Element`)
  assert.equal(dom.tagName, "MAP", "should have tagName 'MAP'")
  assert.ok(dom.getAttribute('centerZoom'), "should have centerZoom attribute")
  assert.deepEqual(jsonAttribute(dom, 'centerZoom'), {zoom: 7, center: [4, 5]}, "should have expected value")
  assert.equal(dom.id, "someid", "should have expected id")
  assert.ok(dom.instance, `should have 'instance' property`)
  assert.equal(dom.instance instanceof L.Map, true, "should be an L.Map")
  assert.end()
})

test("createMapOnElement", assert => {
  assert.throws(() => createMapOnElement(), "should throw when missing required arguments")
  const element = document.createElement('div')
  assert.throws(() => createMapOnElement(3, 'thing', new VNode('map')), "should throw when anchorElement is not an Element")
  assert.throws(() => createMapOnElement(element, 3, new VNode('map')), "should throw when accessToken is not a string")
  assert.throws(() => createMapOnElement(element, "thing", 3), "should throw when initialVDom is not a VNode")

  const options = { zoomControl: false }
  createMapOnElement(element, `pk.eyJ1IjoibXJyZWRlYXJzIiwiYSI6IjQtVVRTZkEifQ.ef_cKBTmj8rSr7VypppZdg`, new VNode(`map`, {options}))
  const dom = element.mapDOM
  assert.ok(dom, "should create mapDOM property on element")
  assert.equal(dom instanceof Element, true, `should be instance of Element`)
  assert.equal(dom.tagName, `MAP`, `should have tagName 'MAP'`)
  assert.ok(dom, `should have 'instance' property`)
  assert.equal(element.mapDOM.instance instanceof L.Map, true, `should be an L.Map`)
  assert.end()

})

test("render tileLayer", assert => {
  assert.throws(() => render(new VNode(`tileLayer`), {}), `should throw when missing parent element`)
  const element1 = document.createElement('div')
  const invalid = new VNode('map', {anchorElement: element1, centerZoom: {zoom: 7, center: [4, 5]}}, [
      new VNode('tileLayer', {})
    ])
  assert.throws(() => render(invalid), `should throw when missing 'tile' property`)
  const element2 = document.createElement('div')
  const valid = new VNode('map', {anchorElement: element2, centerZoom: {zoom: 7, center: [4, 5]}}, [
      new VNode('tileLayer', {tile: `blah`, attributes: {id: `someid`}})
    ])
  const rootDom = render(valid)
  assert.ok(rootDom.children, "should have children")
  assert.equal(rootDom.children.length, 1, "should have one child")
  const dom = rootDom.children[0]
  assert.equal(dom.tagName, "TILELAYER", "should have tagName 'TILELAYER'")
  assert.ok(dom.getAttribute('tile'), "should have tile attribute")
  assert.equal(dom.getAttribute('tile'), "blah", "should have expected value")
  assert.deepEqual(dom.id, "someid", "should have expected id")
  assert.ok(dom.instance, `should have 'instance' property`)
  assert.equal(dom.instance instanceof L.TileLayer, true, "should be an L.TileLayer")
  assert.end()
})

test("render circleMarker", assert => {
  assert.throws(() => render(new VNode(`circleMarker`), {latLng: [4, 5], radius: 3}), `should throw when missing parent element`)
  let element1 = document.createElement('div')
  let invalid = new VNode('map', {anchorElement: element1, centerZoom: {zoom: 7, center: [4, 5]}}, [
      new VNode('circleMarker', {radius: 3})
    ])
  assert.throws(() => render(invalid), `should throw when missing 'latLng' property`)
  element1 = document.createElement('div')
  invalid = new VNode('map', {anchorElement: element1, centerZoom: {zoom: 7, center: [4, 5]}}, [
      new VNode('circleMarker', {latLng: [4, 5]})
    ])
  assert.throws(() => render(invalid), `should throw when missing 'radius' property`)
  element1 = document.createElement('div')
  const valid = new VNode('map', {anchorElement: element1, centerZoom: {zoom: 7, center: [4, 5]}}, [
      new VNode('circleMarker', {latLng: [4, 5], radius: 3, attributes: {id: `someid`}})
    ])
  const rootDom = render(valid)
  assert.ok(rootDom.children, "should have children")
  assert.equal(rootDom.children.length, 1, "should have one child")
  const dom = rootDom.children[0]
  assert.equal(dom instanceof Element, true, `should be instance of Element`)
  assert.equal(dom.tagName, `CIRCLEMARKER`, `should have tagName 'CIRCLEMARKER'`)
  assert.ok(dom.getAttribute('latLng'), `should have latLng attribute`)
  assert.deepEqual(jsonAttribute(dom, `latLng`), [4, 5], `should have expected latLng value`)
  assert.ok(dom.getAttribute('radius'), `should have radius attribute`)
  assert.deepEqual(jsonAttribute(dom, `radius`), 3, "should have expected radius value")
  assert.ok(dom.instance, `should have 'instance' property`)
  assert.equal(dom.instance instanceof L.CircleMarker, true, "should be an L.CircleMarker")
  assert.end()
})

test("render marker", assert => {
  assert.throws(() => render(new VNode(`marker`), {latLng: [4, 5]}), `should throw when missing parent element`)
  let element1 = document.createElement('div')
  let invalid = new VNode('map', {anchorElement: element1, centerZoom: {zoom: 7, center: [4, 5]}}, [
      new VNode('marker', {})
    ])
  assert.throws(() => render(invalid), `should throw when missing 'latLng' property`)
  element1 = document.createElement('div')
  const valid = new VNode('map', {anchorElement: element1, centerZoom: {zoom: 7, center: [4, 5]}}, [
      new VNode('marker', {latLng: [4, 5], attributes: {id: `someid`}})
    ])
  const rootDom = render(valid)
  assert.ok(rootDom.children, `should have children`)
  assert.equal(rootDom.children.length, 1, `should have one child`)
  const dom = rootDom.children[0]
  assert.equal(dom instanceof Element, true, `should be instance of Element`)
  assert.equal(dom.tagName, `MARKER`, `should have tagName 'MARKER'`)
  assert.ok(dom.getAttribute('latLng'), `should have latLng attribute`)
  assert.deepEqual(jsonAttribute(dom, `latLng`), [4, 5], `should have expected latLng value`)
  assert.ok(dom.instance, `should have 'instance' property`)
  assert.equal(dom.instance instanceof L.Marker, true, `should be an L.Marker`)
  assert.equal(dom.instance.options.icon instanceof L.Icon.Default, true, `should be an L.Icon.Default`)
  //console.log(dom.instance)
  assert.end()
})

test("render divIcon", assert => {
  //assert.throws(() => render(new VNode(`divIcon`), {}), `should throw when instantiated without a marker as a parent node`)

  let element1 = document.createElement('div')
  const options = {iconSize: [60, 60], html: 'blah'}
  let invalid =
    new VNode(`map`, {anchorElement: element1, centerZoom: {zoom: 7, center: [4, 5]}}, [
      new VNode('layerGroup', {}, [
        new VNode('divIcon', {options})
      ])
    ])
  assert.throws(() => render(invalid), `should throw when missing parent is not marker`)
  element1 = document.createElement('div')
  let valid =
    new VNode(`map`, {anchorElement: element1, centerZoom: {zoom: 7, center: [4, 5]}}, [
      new VNode('marker', {latLng: [4, 5]}, [
        new VNode('divIcon', {options})
      ])
    ])
  const rootDom = render(valid)
  assert.ok(rootDom.children, `should have one map children`)
  assert.equal(rootDom.children.length, 1, `should have one child`)
  const markerDom = rootDom.children[0]
  assert.ok(markerDom.instance.options, `should have 'options' property on marker.instance`)
  assert.ok(markerDom.instance.options.icon, `should have 'icon' property on marker.instance.options`)
  assert.equal(markerDom.instance.options.icon instanceof L.DivIcon, true, `should be instance of L.DivIcon`)
  assert.ok(markerDom.children, `should have marker children`)
  assert.equal(markerDom.children.length, 1, `should have one child`)
  const dom = markerDom.children[0]
  assert.ok(dom.instance, `should have 'instance' property on divIcon`)
  const instance = dom.instance
  assert.ok(instance.options, `should have 'options' property on instance`)
  assert.equal(instance instanceof L.DivIcon, true, `should be an L.DivIcon`)
  assert.deepEqual(instance.options.iconSize, options.iconSize, `should have expected options iconSize value`)
  assert.deepEqual(instance.options.html, options.html, `should have expected options html value`)

  assert.end()
})

test("render icon", assert => {
  const options = {
    iconUrl: 'my-icon.png',
    iconRetinaUrl: 'my-icon@2x.png',
    iconSize: [38, 95],
    iconAnchor: [22, 94],
    popupAnchor: [-3, -76],
    shadowUrl: 'my-icon-shadow.png',
    shadowRetinaUrl: 'my-icon-shadow@2x.png',
    shadowSize: [68, 95],
    shadowAnchor: [22, 94]
  }

  let element1 = document.createElement('div')
  let invalid =
    new VNode(`map`, {anchorElement: element1, centerZoom: {zoom: 7, center: [4, 5]}}, [
      new VNode('layerGroup', {}, [
        new VNode('icon', {options})
      ])
    ])
  assert.throws(() => render(invalid), `should throw when missing parent is not marker`)
  element1 = document.createElement('div')
  let valid =
    new VNode(`map`, {anchorElement: element1, centerZoom: {zoom: 7, center: [4, 5]}}, [
      new VNode('marker', {latLng: [4, 5]}, [
        new VNode('icon', {options})
      ])
    ])
  const rootDom = render(valid)
  assert.ok(rootDom.children, `should have one map children`)
  assert.equal(rootDom.children.length, 1, `should have one child`)
  const markerDom = rootDom.children[0]
  assert.ok(markerDom.instance.options, `should have 'options' property on marker.instance`)
  assert.ok(markerDom.instance.options.icon, `should have 'icon' property on marker.instance.options`)
  assert.equal(markerDom.instance.options.icon instanceof L.Icon, true, `should be instance of L.Icon`)
  assert.ok(markerDom.children, `should have marker children`)
  assert.equal(markerDom.children.length, 1, `should have one child`)
  const dom = markerDom.children[0]
  assert.ok(dom.instance, `should have 'instance' property on icon`)
  const instance = dom.instance
  assert.ok(instance.options, `should have 'options' property on instance`)
  assert.equal(instance instanceof L.Icon, true, `should be an L.Icon`)
  assert.deepEqual(instance.options.iconSize, options.iconSize, `should have expected options iconSize value`)
  assert.deepEqual(instance.options.iconUrl, options.iconUrl, `should have expected options iconUrl value`)

  assert.end()
})

test("render layerGroup", assert => {
  assert.throws(() => render(new VNode(`layerGroup`), {}), `should throw when missing parent element`)
  let element1 = document.createElement('div')
  const valid = new VNode(`map`, {anchorElement: element1, centerZoom: {zoom: 7, center: [4, 5]}}, [
      new VNode(`layerGroup`, {attributes: {id: `someid`}})
    ])
  const rootDom = render(valid)
  assert.ok(rootDom.children, "should have children")
  assert.equal(rootDom.children.length, 1, "should have one child")
  const dom = rootDom.children[0]
  assert.equal(dom.tagName, `LAYERGROUP`, `should have tagName 'LAYERGROUP'`)
  assert.deepEqual(dom.id, "someid", `should have expected id`)
  assert.ok(dom.instance, `should have 'instance' property`)
  assert.equal(dom.instance instanceof L.LayerGroup, true, `should be an L.LayerGroup`)
  assert.end()
})

test("render featureGroup", assert => {
  assert.throws(() => render(new VNode(`featureGroup`), {}), `should throw when missing parent element`)
  let element1 = document.createElement('div')
  const valid = new VNode(`map`, {anchorElement: element1, centerZoom: {zoom: 7, center: [4, 5]}}, [
      new VNode(`featureGroup`, {attributes: {id: `someid`}})
    ])
  const rootDom = render(valid)
  assert.ok(rootDom.children, `should have children`)
  assert.equal(rootDom.children.length, 1, `should have one child`)
  const dom = rootDom.children[0]
  assert.equal(dom.tagName, `FEATUREGROUP`, `should have tagName 'FEATUREGROUP'`)
  assert.deepEqual(dom.id, `someid`, `should have expected id`)
  assert.ok(dom.instance, `should have 'instance' property`)
  assert.equal(dom.instance instanceof L.FeatureGroup, true, `should be an L.FeatureGroup`)
  assert.end()
})

test("patch map", assert => {
  const element1 = document.createElement('div')
  const vdom = new VNode('map', {anchorElement: element1, centerZoom: {zoom: 7, center: [4, 5]}, attributes: {id: `someid`}}, [], `test`)
  const dom = render(vdom)
  assert.deepEqual(jsonAttribute(dom, `centerZoom`), {zoom: 7, center: [4, 5]}, `should have expected centerZoom value`)
  const newvdom = new VNode(`map`, {anchorElement: element1, centerZoom: {zoom: 8, center: [6, 5]}, attributes: {id: `someid`}}, [
    new VNode(`tileLayer`, {tile: `blah`, attributes: {id: `someid2`}})
  ], `test`)
  const patches = diff(vdom, newvdom)
  let newDom = patch(dom, patches, {render: render, patch: patchRecursive})
  assert.deepEqual(jsonAttribute(dom, `centerZoom`), {zoom: 8, center: [6, 5]}, `should have updated centerZoom value`)
  assert.equal(dom, newDom, `should return same root dom element reference`)
  assert.equal(dom.children.length, 1, `should have one child`)
  assert.end()
})

test("patch tileLayer", assert => {
  const element1 = document.createElement('div')
  const vdom = new VNode('map', {anchorElement: element1, centerZoom: {zoom: 7, center: [4, 5]}}, [
    new VNode('tileLayer', {tile: `blah`, attributes: {id: `someid`}}, [])
  ])
  const rootDom = render(vdom)
  const dom = rootDom.children[0]
  assert.equal(dom.getAttribute(`tile`), `blah`, `should have expected tile value`)
  assert.equal(dom.id, `someid`, `should have expected element id `)
  const newvdom = new VNode('map', {anchorElement: element1, centerZoom: {zoom: 7, center: [4, 5]}}, [
    new VNode('tileLayer', {tile: `notblah`, attributes: {id: `someid`}}, [])
  ])
  const patches = diff(vdom, newvdom)
  let newDom = patch(rootDom, patches, {render: render, patch: patchRecursive})
  assert.equal(dom.getAttribute(`tile`), `notblah`, `should have updated tile value`)
  assert.equal(dom.id, `someid`, `should have same element id`)
  assert.end()
})

test("patch circleMarker", assert => {
  const element1 = document.createElement('div')
  const vdom = new VNode('map', {anchorElement: element1, centerZoom: {zoom: 7, center: [4, 5]}}, [
    new VNode('circleMarker', {latLng: [4, 5], radius: 3, attributes: {id: `someid`}}, [])
  ])
  const rootDom = render(vdom)
  const dom = rootDom.children[0]
  assert.deepEqual(jsonAttribute(dom, `latLng`), [4, 5], `should have expected latLng value`)
  assert.equal(jsonAttribute(dom, `radius`), 3, `should have expected radius value`)
  assert.equal(dom.id, `someid`, `should have expected element id `)
  const newvdom = new VNode('map', {anchorElement: element1, centerZoom: {zoom: 7, center: [4, 5]}}, [
    new VNode('circleMarker', {latLng: [4, 6], radius: 4, attributes: {id: `someid`}}, [])
  ])
  const patches = diff(vdom, newvdom)
  let newDom = patch(rootDom, patches, {render: render, patch: patchRecursive})
  assert.deepEqual(jsonAttribute(dom, `latLng`), [4, 6], `should have updated latLng value`)
  assert.equal(jsonAttribute(dom, `radius`), 4, `should have updated radius value`)
  assert.equal(dom.id, `someid`, `should have same element id`)
  assert.end()
})

test("patch marker", assert => {
  const element1 = document.createElement('div')
  const vdom = new VNode('map', {anchorElement: element1, centerZoom: {zoom: 7, center: [4, 5]}}, [
    new VNode('marker', {latLng: [4, 5], attributes: {id: `someid`}}, [])
  ])
  const rootDom = render(vdom)
  const dom = rootDom.children[0]
  assert.deepEqual(jsonAttribute(dom, `latLng`), [4, 5], `should have expected latLng value`)
  assert.equal(dom.id, `someid`, `should have expected element id `)
  assert.equal(dom.instance.options.icon instanceof L.Icon.Default, true, `should be an L.Icon.Default`)
  const newvdom = new VNode('map', {anchorElement: element1, centerZoom: {zoom: 7, center: [4, 5]}}, [
    new VNode('marker', {latLng: [7, 6], attributes: {id: `someid`}}, [])
  ])
  const patches = diff(vdom, newvdom)
  let newDom = patch(rootDom, patches, {render: render, patch: patchRecursive})
  assert.deepEqual(jsonAttribute(dom, `latLng`), [7, 6], `should have updated latLng value`)
  assert.equal(dom.id, `someid`, `should have same element id`)
  assert.equal(dom.instance.options.icon instanceof L.Icon.Default, true, `should still be an L.Icon.Default`)
  assert.end()
})

test("patch marker w/ divIcon", assert => {
  const options = {iconSize: [60, 60], html: 'blah'}
  const element1 = document.createElement('div')
  const vdom = new VNode('map', {anchorElement: element1, centerZoom: {zoom: 7, center: [4, 5]}}, [
    new VNode('marker', {latLng: [4, 5], attributes: {id: `someid`}}, [])
  ])
  const rootDom = render(vdom)
  const dom = rootDom.children[0]
  assert.deepEqual(jsonAttribute(dom, `latLng`), [4, 5], `should have expected latLng value`)
  assert.equal(dom.id, `someid`, `should have expected element id `)
  assert.equal(dom.instance.options.icon instanceof L.Icon.Default, true, `should be an L.Icon.Default`)
  const newvdom = new VNode('map', {anchorElement: element1, centerZoom: {zoom: 7, center: [4, 5]}}, [
    new VNode('marker', {latLng: [7, 6], attributes: {id: `someid`}}, [
      new VNode('divIcon', {options})
    ])
  ])
  const patches = diff(vdom, newvdom)
  let newDom = patch(rootDom, patches, {render: render, patch: patchRecursive})
  assert.deepEqual(jsonAttribute(dom, `latLng`), [7, 6], `should have updated latLng value`)
  assert.equal(dom.id, `someid`, `should have same element id`)
  assert.equal(dom.instance.options.icon instanceof L.DivIcon, true, `should now be an L.DivIcon`)
  assert.end()
})

test("patch marker w/ icon", assert => {
  const options = {
    iconUrl: 'my-icon.png',
    iconRetinaUrl: 'my-icon@2x.png',
    iconSize: [38, 95],
    iconAnchor: [22, 94],
    popupAnchor: [-3, -76],
    shadowUrl: 'my-icon-shadow.png',
    shadowRetinaUrl: 'my-icon-shadow@2x.png',
    shadowSize: [68, 95],
    shadowAnchor: [22, 94]
  }
  const element1 = document.createElement('div')
  const vdom = new VNode('map', {anchorElement: element1, centerZoom: {zoom: 7, center: [4, 5]}}, [
    new VNode('marker', {latLng: [4, 5], attributes: {id: `someid`}}, [])
  ])
  const rootDom = render(vdom)
  const dom = rootDom.children[0]
  assert.deepEqual(jsonAttribute(dom, `latLng`), [4, 5], `should have expected latLng value`)
  assert.equal(dom.id, `someid`, `should have expected element id `)
  assert.equal(dom.instance.options.icon instanceof L.Icon.Default, true, `should be an L.Icon.Default`)
  const newvdom = new VNode('map', {anchorElement: element1, centerZoom: {zoom: 7, center: [4, 5]}}, [
    new VNode('marker', {latLng: [7, 6], attributes: {id: `someid`}}, [
      new VNode('icon', {options})
    ])
  ])
  const patches = diff(vdom, newvdom)
  let newDom = patch(rootDom, patches, {render: render, patch: patchRecursive})
  assert.deepEqual(jsonAttribute(dom, `latLng`), [7, 6], `should have updated latLng value`)
  assert.equal(dom.id, `someid`, `should have same element id`)
  assert.equal(dom.instance.options.icon instanceof L.Icon, true, `should now be an L.Icon`)
  assert.deepEqual(dom.instance.options.icon.options.iconSize, options.iconSize, `should have expected options iconSize value`)
  assert.deepEqual(dom.instance.options.icon.options.iconUrl, options.iconUrl, `should have expected options iconUrl value`)
  assert.end()
})

test("patch marker w/ icon options change", assert => {
  let options = {
    iconUrl: 'my-icon.png',
    iconRetinaUrl: 'my-icon@2x.png',
    iconSize: [38, 95],
    iconAnchor: [22, 94],
    popupAnchor: [-3, -76],
    shadowUrl: 'my-icon-shadow.png',
    shadowRetinaUrl: 'my-icon-shadow@2x.png',
    shadowSize: [68, 95],
    shadowAnchor: [22, 94]
  }
  const element1 = document.createElement('div')
  const vdom = new VNode('map', {anchorElement: element1, centerZoom: {zoom: 7, center: [4, 5]}}, [
    new VNode('marker', {latLng: [4, 5], attributes: {id: `someid`}}, [
      new VNode('icon', {options})
    ])
  ])
  const rootDom = render(vdom)
  const dom = rootDom.children[0]
  assert.deepEqual(jsonAttribute(dom, `latLng`), [4, 5], `should have expected latLng value`)
  assert.equal(dom.id, `someid`, `should have expected element id `)
  assert.equal(dom.instance.options.icon instanceof L.Icon, true, `should be an L.Icon`)
  options = {
    iconUrl: 'blah',
    iconRetinaUrl: 'my-icon@2x.png',
    iconSize: [38, 95],
    iconAnchor: [22, 94],
    popupAnchor: [-3, -76],
    shadowUrl: 'my-icon-shadow.png',
    shadowRetinaUrl: 'my-icon-shadow@2x.png',
    shadowSize: [68, 95],
    shadowAnchor: [22, 94]
  }
  const newvdom = new VNode('map', {anchorElement: element1, centerZoom: {zoom: 7, center: [4, 5]}}, [
    new VNode('marker', {latLng: [4, 5], attributes: {id: `someid`}}, [
      new VNode('icon', {options})
    ])
  ])
  const patches = diff(vdom, newvdom)
  let newDom = patch(rootDom, patches, {render: render, patch: patchRecursive})
  assert.deepEqual(jsonAttribute(dom, `latLng`), [4, 5], `should have updated latLng value`)
  assert.equal(dom.id, `someid`, `should have same element id`)
  assert.equal(dom.instance.options.icon instanceof L.Icon, true, `should now be an L.Icon`)
  assert.deepEqual(dom.instance.options.icon.options.iconSize, options.iconSize, `should have same options iconSize value`)
  assert.deepEqual(dom.instance.options.icon.options.iconUrl, 'blah', `should have updated options iconUrl value`)
  assert.end()
})

test("patch featureGroup", assert => {
  const element1 = document.createElement('div')
  const vdom = new VNode('map', {anchorElement: element1, centerZoom: {zoom: 7, center: [4, 5]}}, [
    new VNode('featureGroup', {style: {color: '#345'}, attributes: {id: `someid`}}, [])
  ])
  const rootDom = render(vdom)
  const dom = rootDom.children[0]
  assert.deepEqual(jsonAttribute(dom, `style`), {color: `#345`}, `should have expected style value`)
  assert.equal(dom.id, `someid`, `should have expected element id `)
  const newvdom = new VNode('map', {anchorElement: element1, centerZoom: {zoom: 7, center: [4, 5]}}, [
    new VNode('featureGroup', {style: {color: `#327`}, attributes: {id: `someid`}}, [])
  ])
  const patches = diff(vdom, newvdom)
  let newDom = patch(rootDom, patches, {render: render, patch: patchRecursive})
  assert.deepEqual(jsonAttribute(dom, `style`), {color: `#327`}, `should have updated style value`)
  assert.equal(dom.id, `someid`, `should have same element id`)
  assert.end()
})
