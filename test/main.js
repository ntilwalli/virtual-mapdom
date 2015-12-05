import test from 'tape'
import {createElement, patchRecursive, createMapOnElement} from '../index'
import L from 'mapbox.js'
import {VNode, diff, patch} from 'virtual-dom'


//import * as document from 'global/document'

//console.log(L)

//let L = LNoDefault.default


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

// render tests
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

// render tests
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


//
// test("render text node", function (assert) {
//     var vdom = h("span", "hello")
//     var dom = render(vdom)
//     assert.equal(dom.tagName, "SPAN")
//     assert.notOk(dom.id)
//     assert.notOk(dom.className)
//     assert.equal(dom.childNodes.length, 1)
//     assert.equal(dom.childNodes[0].data, "hello")
//     assert.end()
// })
//
// test("render div", function (assert) {
//     var vdom = h()
//     var dom = render(vdom)
//     assert.notOk(dom.id)
//     assert.notOk(dom.className)
//     assert.equal(dom.tagName, "DIV")
//     assert.equal(dom.childNodes.length, 0)
//     assert.end()
// })
//
// test("node id is applied correctly", function (assert) {
//     var vdom = h("#important")
//     var dom = render(vdom)
//     assert.equal(dom.id, "important")
//     assert.notOk(dom.className)
//     assert.equal(dom.tagName, "DIV")
//     assert.equal(dom.childNodes.length, 0)
//     assert.end()
// })
//
// test("node class name is applied correctly", function (assert) {
//     var vdom = h(".pretty")
//     var dom = render(vdom)
//     assert.notOk(dom.id)
//     assert.equal(dom.className, "pretty")
//     assert.equal(dom.tagName, "DIV")
//     assert.equal(dom.childNodes.length, 0)
//     assert.end()
// })
//
// test("mixture of node/classname applied correctly", function (assert) {
//     var vdom = h("#override.very", { id: "important", className: "pretty"})
//     var dom = render(vdom)
//     assert.equal(dom.id, "important")
//     assert.equal(dom.className, "very pretty")
//     assert.equal(dom.tagName, "DIV")
//     assert.equal(dom.childNodes.length, 0)
//     assert.end()
// })
//
// test("style object is applied correctly", function (assert) {
//     var vdom = h("#important.pretty", { style: {
//         border: "1px solid rgb(0, 0, 0)",
//         padding: "2px"
//     } })
//     var dom = render(vdom)
//     assert.equal(dom.id, "important")
//     assert.equal(dom.className, "pretty")
//     assert.equal(dom.tagName, "DIV")
//     assert.equal(dom.style.border, style("border", "1px solid rgb(0, 0, 0)"))
//     assert.equal(dom.style.padding, style("padding", "2px"))
//     assert.equal(dom.childNodes.length, 0)
//     assert.end()
// })
//
// test("children are added", function (assert) {
//     var vdom = h("div", [
//         h("div", [
//             "just testing",
//             "multiple",
//             h("b", "nodes")
//         ]),
//         "hello",
//         h("span", "test")
//     ])
//
//     var dom = render(vdom)
//
//     assert.equal(dom.childNodes.length, 3)
//
//     var nodes = dom.childNodes
//     assert.equal(nodes.length, 3)
//     assert.equal(nodes[0].tagName, "DIV")
//     assert.equal(nodes[1].data, "hello")
//     assert.equal(nodes[2].tagName, "SPAN")
//
//     var subNodes0 = nodes[0].childNodes
//     assert.equal(subNodes0.length, 3)
//     assert.equal(subNodes0[0].data, "just testing")
//     assert.equal(subNodes0[1].data, "multiple")
//     assert.equal(subNodes0[2].tagName, "B")
//
//     var subNodes0_2 = subNodes0[2].childNodes
//     assert.equal(subNodes0_2.length, 1)
//     assert.equal(subNodes0_2[0].data, "nodes")
//
//     var subNodes2 = nodes[2].childNodes
//     assert.equal(subNodes2.length, 1)
//     assert.equal(subNodes2[0].data, "test")
//     assert.end()
// })
//
// test("incompatible children are ignored", function (assert) {
//     var vdom = h("#important.pretty", {
//         style: {
//             "cssText": "color: red;"
//         }
//     }, [
//         null
//     ])
//     var dom = render(vdom)
//     assert.equal(dom.id, "important")
//     assert.equal(dom.className, "pretty")
//     assert.equal(dom.tagName, "DIV")
//     assert.equal(dom.style.cssText, style("cssText", "color: red;"))
//     assert.equal(dom.childNodes.length, 0)
//     assert.end()
// })
//
// test("injected document object is used", function (assert) {
//     var vdom = h("div", "hello")
//     var count = 0
//     var doc = {
//         createElement: function createElement(tagName) {
//             assert.equal(tagName, "DIV")
//             count++
//             return { tagName: "DIV", appendChild: function (t) {
//                 assert.equal(t, "hello")
//                 count++
//             } }
//         },
//         createTextNode: function createTextNode(text) {
//             assert.equal(text, "hello")
//             count++
//             return text
//         }
//     }
//     render(vdom, { document: doc })
//     assert.equal(count, 3)
//     assert.end()
// })
//
// test("injected warning is used", function (assert) {
//     var badObject = {}
//     var vdom = h("#important.pretty", {
//         style: {
//             cssText: "color: red;"
//         }
//     })
//
//     vdom.children = [
//         badObject, null
//     ]
//
//     var i = 0
//     function warn(warning, node) {
//         assert.equal(warning, "Item is not a valid virtual dom node")
//
//         if (i === 0) {
//             assert.equal(node, badObject)
//         } else if (i === 1) {
//             assert.equal(node, null)
//         } else {
//             assert.error("Too many warnings")
//         }
//
//         i++
//     }
//
//     var dom = render(vdom, { warn: warn })
//     assert.equal(dom.id, "important")
//     assert.equal(dom.className, "pretty")
//     assert.equal(dom.tagName, "DIV")
//     assert.equal(dom.style.cssText, style("cssText", "color: red;"))
//     assert.equal(dom.childNodes.length, 0)
//     assert.equal(i, 2)
//     assert.end()
// })
//
// // Complete patch tests
// test("textnode update test", function (assert) {
//     var hello = h("div", "hello")
//     var goodbye = h("div", "goodbye")
//     var rootNode = render(hello)
//     var equalNode = render(goodbye)
//     var patches = diff(hello, goodbye)
//     var newRoot = patch(rootNode, patches)
//     assertEqualDom(assert, newRoot, equalNode)
//     assert.end()
// })
//
// test("textnode replace test", function (assert) {
//     var hello = h("div", "hello")
//     var goodbye = h("div", [h("span", "goodbye")])
//     var rootNode = render(hello)
//     var equalNode = render(goodbye)
//     var patches = diff(hello, goodbye)
//     var newRoot = patch(rootNode, patches)
//     assertEqualDom(assert, newRoot, equalNode)
//     assert.end()
// })
//
// test("textnode insert test", function (assert) {
//     var hello = h("div", "hello")
//     var again = h("span", ["hello", "again"])
//     var rootNode = render(hello)
//     var equalNode = render(again)
//     var patches = diff(hello, again)
//     var newRoot = patch(rootNode, patches)
//     assertEqualDom(assert, newRoot, equalNode)
//     assert.end()
// })
//
// test("textnode remove", function (assert) {
//     var again = h("span", ["hello", "again"])
//     var hello = h("div", "hello")
//     var rootNode = render(again)
//     var equalNode = render(hello)
//     var patches = diff(again, hello)
//     var newRoot = patch(rootNode, patches)
//     assertEqualDom(assert, newRoot, equalNode)
//     assert.end()
// })
//
// test("dom node update test", function (assert) {
//     var hello = h("div.hello", "hello")
//     var goodbye = h("div.goodbye", "goodbye")
//     var rootNode = render(hello)
//     var equalNode = render(goodbye)
//     var patches = diff(hello, goodbye)
//     var newRoot = patch(rootNode, patches)
//     assertEqualDom(assert, newRoot, equalNode)
//     assert.end()
// })
//
// test("dom node replace test", function (assert) {
//     var hello = h("div", "hello")
//     var goodbye = h("span", "goodbye")
//     var rootNode = render(hello)
//     var equalNode = render(goodbye)
//     var patches = diff(hello, goodbye)
//     var newRoot = patch(rootNode, patches)
//     assertEqualDom(assert, newRoot, equalNode)
//     assert.end()
// })
//
// test("dom node insert", function (assert) {
//     var hello = h("div", [h("span", "hello")])
//     var again = h("div", [h("span", "hello"), h("span", "again")])
//     var rootNode = render(hello)
//     var equalNode = render(again)
//     var patches = diff(hello, again)
//     var newRoot = patch(rootNode, patches)
//     assertEqualDom(assert, newRoot, equalNode)
//     assert.end()
// })
//
// test("dom node remove", function (assert) {
//     var hello = h("div", [h("span", "hello")])
//     var again = h("div", [h("span", "hello"), h("span", "again")])
//     var rootNode = render(again)
//     var equalNode = render(hello)
//     var patches = diff(again, hello)
//     var newRoot = patch(rootNode, patches)
//     assertEqualDom(assert, newRoot, equalNode)
//     assert.end()
// })
//
//
// test("reuse dom node without breaking", function (assert) {
//     var hSpan = h("span", "hello")
//     var hello = h("div", [hSpan, hSpan, hSpan])
//     var goodbye = h("div", [h("span", "hello"), hSpan, h("span", "goodbye")])
//     var rootNode = render(hello)
//     var equalNode = render(goodbye)
//     var patches = diff(hello, goodbye)
//     var newRoot = patch(rootNode, patches)
//     assertEqualDom(assert, newRoot, equalNode)
//
//     // Undo the rendering with new trees
//     hello = h("div", [hSpan, hSpan, hSpan])
//     goodbye = h("div", [h("span", "hello"), hSpan, h("span", "goodbye")])
//     patches = diff(goodbye, hello)
//     newRoot = patch(rootNode, patches)
//     assertEqualDom(assert, newRoot, rootNode)
//
//     assert.end()
// })
//
// test("Allow empty textnode", function (assert) {
//     var empty = h("span", "")
//     var rootNode = render(empty)
//     assert.equal(rootNode.childNodes.length, 1)
//     assert.equal(rootNode.childNodes[0].data, "")
//     assert.end()
// })
//
// test("Can replace vnode with vtext", function (assert) {
//
//     var leftNode = h("div", h("div"))
//     var rightNode = h("div", "text")
//
//     var rootNode = render(leftNode)
//
//     assert.equal(rootNode.childNodes.length, 1)
//     assert.equal(rootNode.childNodes[0].nodeType, 1)
//
//     var patches = diff(leftNode, rightNode)
//
//     var newRoot = patch(rootNode, patches)
//
//     assert.equal(newRoot, rootNode)
//
//     assert.equal(newRoot.childNodes.length, 1)
//     assert.equal(newRoot.childNodes[0].nodeType, 3)
//
//     assert.end()
// })
