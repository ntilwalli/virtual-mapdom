'use strict';

var _tape = require('tape');

var _tape2 = _interopRequireDefault(_tape);

var _index = require('../index');

var _mapbox = require('mapbox.js');

var _mapbox2 = _interopRequireDefault(_mapbox);

var _virtualDom = require('virtual-dom');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _typeof(obj) { return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj; }

// createMapOnElement tests
(0, _tape2.default)("createMapOnElement is a function", function (assert) {
  assert.equal(typeof _index.createMapOnElement === 'undefined' ? 'undefined' : _typeof(_index.createMapOnElement), "function", "createMapOnElement should be a function");
  assert.end();
});

(0, _tape2.default)("map DOM element and map instance are instantiated and attached to given element", function (assert) {
  var element = document.createElement('div');
  var options = { zoomControl: false };
  (0, _index.createMapOnElement)(element, "pk.eyJ1IjoibXJyZWRlYXJzIiwiYSI6IjQtVVRTZkEifQ.ef_cKBTmj8rSr7VypppZdg", new _virtualDom.VNode('map', { options: options }));
  assert.equal(element.mapDOM.tagName, 'MAP', "property mapDOM should contain element with tagName 'MAP'");
  assert.equal(true, element.mapDOM.instance instanceof _mapbox2.default.Map, "property mapDOM should have have instance property that is an L.Map");
  assert.end();
});

// createElement tests
(0, _tape2.default)("render is a function", function (assert) {
  assert.equal(typeof _index.render === 'undefined' ? 'undefined' : _typeof(_index.render), "function", 'render should be a function');
  assert.end();
});

(0, _tape2.default)("render outputs the expected mapDOM element with properties and attributes", function (assert) {
  var vdom = new _virtualDom.VNode('tileLayer', { tile: "blah", attributes: { id: "someid" } });

  var dom = (0, _index.render)(vdom);

  assert.equal(dom.tagName, "TILELAYER", "should create element with tagName 'TILELAYER'");
  assert.equal(dom.tile, "blah", "created element should have expected tile property value");
  assert.deepEqual(dom.id, "someid", "created element should expected id property value");
  assert.end();
});

// patchRecursive tests
(0, _tape2.default)("patch is a function", function (assert) {
  assert.equal(typeof _index.patchRecursive === 'undefined' ? 'undefined' : _typeof(_index.patchRecursive), "function", 'patchRecursive should be a function');
  assert.end();
});

(0, _tape2.default)("patches mapDOM element to expected properties and attributes", function (assert) {
  var element = document.createElement('div');
  var firstVdom = new _virtualDom.VNode('map', { centerZoom: { zoom: 7, center: [4, 5] } });
  (0, _index.createMapOnElement)(element, "pk.eyJ1IjoibXJyZWRlYXJzIiwiYSI6IjQtVVRTZkEifQ.ef_cKBTmj8rSr7VypppZdg", firstVdom);
  var secondVdom = new _virtualDom.VNode('map', { centerZoom: { zoom: 8, center: [5, 6] } });
  var dom = element.mapDOM;
  assert.equal(dom.tagName, "MAP", "should have root element with tagName 'MAP' ");
  assert.deepEqual(dom.centerZoom, { zoom: 7, center: [4, 5] }, "should have passed initial centerZoom value");
  var patches = (0, _virtualDom.diff)(firstVdom, secondVdom);

  var newRoot = (0, _virtualDom.patch)(element, patches, { render: _index.render, patch: _index.patchRecursive });
  assert.deepEqual(dom.centerZoom, { zoom: 8, center: [5, 6] }, "should have patched centerZoom value");
  assert.end();
});