'use strict';

var _tapeCatch = require('tape-catch');

var _tapeCatch2 = _interopRequireDefault(_tapeCatch);

var _index = require('../index');

var _mapbox = require('mapbox.js');

var _mapbox2 = _interopRequireDefault(_mapbox);

var _virtualDom = require('virtual-dom');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _typeof(obj) { return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj; }

// createMapOnElement tests
(0, _tapeCatch2.default)("createMapOnElement is a function", function (assert) {
  assert.equal(typeof _index.createMapOnElement === 'undefined' ? 'undefined' : _typeof(_index.createMapOnElement), "function", "createMapOnElement should be a function");
  assert.end();
});

(0, _tapeCatch2.default)("map DOM element and map instance are instantiated and attached to given element", function (assert) {
  var element = document.createElement('div');
  var options = { zoomControl: false };
  (0, _index.createMapOnElement)(element, "pk.eyJ1IjoibXJyZWRlYXJzIiwiYSI6IjQtVVRTZkEifQ.ef_cKBTmj8rSr7VypppZdg", new _virtualDom.VNode('map', { options: options }));
  assert.equal(element.mapDOM.tagName, 'MAP', "property mapDOM should contain element with tagName 'MAP'");
  assert.equal(true, element.mapDOM.instance instanceof _mapbox2.default.Map, "property mapDOM should have have instance property that is an L.Map");
  assert.end();
});

// createElement tests
(0, _tapeCatch2.default)("render is a function", function (assert) {
  assert.equal(typeof _index.render === 'undefined' ? 'undefined' : _typeof(_index.render), "function", 'render should be a function');
  assert.end();
});

(0, _tapeCatch2.default)("render outputs the expected mapDOM element with properties and attributes", function (assert) {
  var vdom = new _virtualDom.VNode('tileLayer', { tile: "blah", attributes: { id: "someid" } });

  var dom = (0, _index.render)(vdom);

  assert.equal(dom.tagName, "TILELAYER", "should create element with tagName 'TILELAYER'");
  assert.equal(dom.getAttribute('tile'), "blah", "created element should have expected tile property value");
  assert.deepEqual(dom.id, "someid", "created element should expected id property value");
  assert.end();
});

// patchRecursive tests
(0, _tapeCatch2.default)("patch is a function", function (assert) {
  assert.equal(typeof _index.patchRecursive === 'undefined' ? 'undefined' : _typeof(_index.patchRecursive), "function", 'patchRecursive should be a function');
  assert.end();
});

(0, _tapeCatch2.default)("patches mapDOM element to expected properties and attributes", function (assert) {
  var element = document.createElement('div');
  var firstVdom = new _virtualDom.VNode('map', { centerZoom: { zoom: 7, center: [4, 5] } });
  (0, _index.createMapOnElement)(element, "pk.eyJ1IjoibXJyZWRlYXJzIiwiYSI6IjQtVVRTZkEifQ.ef_cKBTmj8rSr7VypppZdg", firstVdom);
  var secondVdom = new _virtualDom.VNode('map', { centerZoom: { zoom: 8, center: [5, 6] } });
  var dom = element.mapDOM;
  assert.equal(dom.tagName, "MAP", "should have root element with tagName 'MAP' ");
  assert.deepEqual(JSON.parse(dom.getAttribute('centerZoom')), { zoom: 7, center: [4, 5] }, "should have passed initial centerZoom value");
  var patches = (0, _virtualDom.diff)(firstVdom, secondVdom);
  var newRoot = (0, _virtualDom.patch)(element, patches, { render: _index.render, patch: _index.patchRecursive });
  assert.deepEqual(JSON.parse(dom.getAttribute('centerZoom')), { zoom: 8, center: [5, 6] }, "should have patched centerZoom value");
  assert.end();
});

(0, _tapeCatch2.default)("patches circleMarker element to expected properties and attributes", function (assert) {
  var element = document.createElement('div');
  var firstVdom = new _virtualDom.VNode('map', { centerZoom: { zoom: 7, center: [4, 5] } }, [new _virtualDom.VNode('circleMarker', { key: "cm1", latLng: [10, 11], radius: 3, attributes: { id: "cm1" } })]);
  (0, _index.createMapOnElement)(element, "pk.eyJ1IjoibXJyZWRlYXJzIiwiYSI6IjQtVVRTZkEifQ.ef_cKBTmj8rSr7VypppZdg", firstVdom);
  var secondVdom = new _virtualDom.VNode('map', { centerZoom: { zoom: 7, center: [4, 5] } }, [new _virtualDom.VNode('circleMarker', { key: "cm1", latLng: [12, 14], radius: 4, attributes: { id: "cm1" } }), new _virtualDom.VNode('circleMarker', { key: "cm2", latLng: [1, 2], radius: 5, attributes: { id: "cm2" } })]);
  var dom = element.mapDOM;
  assert.equal(dom.tagName, "MAP", "should have root element with tagName 'MAP' ");
  assert.deepEqual(JSON.parse(dom.getAttribute('centerZoom')), { zoom: 7, center: [4, 5] }, "should have passed initial centerZoom value");
  var cMarkers = dom.getElementsByTagName('circleMarker');
  assert.equal(cMarkers.length, 1, "Initial map has a circleMarker");
  var cm1 = cMarkers[0];
  assert.equal(cm1.tagName, "CIRCLEMARKER", "Has expected tagName");
  assert.ok(cm1.instance, "Has instance property");

  // I don't know what the type of L.circleMarker is, but it seems factory functions starting
  // with lower case don't yield types of the same name
  //assert.equal(true, cm1.instance instanceof L.circleMarker, "Instance has expecte type")

  assert.ok(cm1.getAttribute('latLng'), "Initial circleMarker element has latLng property");
  assert.ok(cm1.getAttribute('radius'), "Initial circleMarker element has radius property");
  assert.deepEqual(JSON.parse(cm1.getAttribute('latLng')), [10, 11], "Initial circleMarker element has expected latLng value");
  assert.deepEqual(JSON.parse(cm1.getAttribute('radius')), 3, "Initial circleMarker element has expected radius value");
  var patches = (0, _virtualDom.diff)(firstVdom, secondVdom);

  var newRoot = (0, _virtualDom.patch)(element, patches, { render: _index.render, patch: _index.patchRecursive });
  cMarkers = dom.getElementsByTagName('circleMarker');
  var len = cMarkers.length;
  assert.equal(len, 2, "Second map has two circleMarkers");
  var cm1Marker = undefined;

  for (var i = 0; i < len; i++) {
    var x = cMarkers[i];
    if (x.id === "cm1") {
      cm1Marker = x;
      assert.deepEqual(JSON.parse(x.getAttribute('latLng')), [12, 14], "Initial circleMarker now has updated latLng property");
      assert.deepEqual(JSON.parse(x.getAttribute('radius')), 4, "Initial circleMarker element has updated radius property");
    } else if (x.id === "cm2") {
      assert.ok(x.getAttribute('latLng'), "second circleMarker element has latLng property");
      assert.ok(x.getAttribute('radius'), "second circleMarker element has radius property");
      assert.deepEqual(JSON.parse(x.getAttribute('latLng')), [1, 2], "second circleMarker element has expected latLng property");
      assert.deepEqual(JSON.parse(x.getAttribute('radius')), 5, "second circleMarker element has expected radius property");
    } else {
      assert.fail();
    }
  }

  var thirdVdom = new _virtualDom.VNode('map', { centerZoom: { zoom: 7, center: [4, 5] } }, [new _virtualDom.VNode('circleMarker', { key: "cm1", latLng: [12, 14], radius: 4, options: { color: '#777' }, attributes: { id: "cm1" } }), new _virtualDom.VNode('circleMarker', { key: "cm2", latLng: [1, 2], radius: 5, attributes: { id: "cm2" } })]);

  patches = (0, _virtualDom.diff)(secondVdom, thirdVdom);
  //console.log("After diff")
  newRoot = (0, _virtualDom.patch)(element, patches, { render: _index.render, patch: _index.patchRecursive });
  //console.log("After patch")
  cMarkers = dom.getElementsByTagName('circleMarker');
  len = cMarkers.length;
  assert.equal(len, 2, "Third map still has two circleMarkers");

  for (var i = 0; i < len; i++) {
    var x = cMarkers[i];
    if (x.id === "cm1") {
      //console.log(x.options)
      assert.deepEqual(JSON.parse(x.getAttribute('latLng')), [12, 14], "Initial circleMarker has not changed latLng property");
      assert.deepEqual(JSON.parse(x.getAttribute('radius')), 4, "Initial circleMarker element has not changed radius property");
      assert.deepEqual(JSON.parse(x.getAttribute('options')), { color: '#777' }, "Initial circleMarker element should now have color property");
      assert.equal(x, cm1Marker, "No new DOM node should have been created, this one should equal the old one");
    } else if (x.id === "cm2") {
      assert.ok(x.getAttribute('latLng'), "second circleMarker element has same latLng property");
      assert.ok(x.getAttribute('radius'), "second circleMarker element has same radius property");
      assert.deepEqual(JSON.parse(x.getAttribute('latLng')), [1, 2], "second circleMarker element has expected latLng property");
      assert.deepEqual(JSON.parse(x.getAttribute('radius')), 5, "second circleMarker element has expected radius property");
    } else {
      assert.fail();
    }
  }

  assert.end();
});

(0, _tapeCatch2.default)("patches marker element to expected properties and attributes", function (t) {
  var element = document.createElement('div');
  var firstVdom = new _virtualDom.VNode('map', { centerZoom: { zoom: 7, center: [4, 5] } }, [new _virtualDom.VNode('marker', { latLng: [10, 11], attributes: { id: "m1" } }, [new _virtualDom.VNode('divIcon', { options: { iconSize: 20, html: 'some random text' }, attributes: { id: 'd1' } }, [], 'd1')], "m1")]);

  (0, _index.createMapOnElement)(element, "pk.eyJ1IjoibXJyZWRlYXJzIiwiYSI6IjQtVVRTZkEifQ.ef_cKBTmj8rSr7VypppZdg", firstVdom);

  var dom = element.mapDOM;
  var markers = dom.getElementsByTagName('marker');
  t.equal(markers.length, 1, "Initial map has a marker");
  var m1 = markers[0];
  t.equal(m1.tagName, "MARKER", "Has expected tagName");
  t.ok(m1.instance, "Has instance property");
  t.ok(m1.getAttribute('latLng'), "Initial marker element has latLng property");

  var icons = dom.getElementsByTagName('divIcon');
  t.equal(icons.length, 1, "Initial map has a divIcon");
  var icon1 = icons[0];
  t.equal(icon1.tagName, "DIVICON", "Has expected tagName");
  t.ok(icon1.instance, "Has instance property");
  t.deepEqual(icon1.parentNode.tagName, 'MARKER', "divIcon has marker for parent");

  var secondVdom = new _virtualDom.VNode('map', { centerZoom: { zoom: 7, center: [4, 5] } }, [new _virtualDom.VNode('marker', { latLng: [12, 14], attributes: { id: "m1" } }, [new _virtualDom.VNode('divIcon', { options: { iconSize: 25, html: 'some random text' }, attributes: { id: 'd1' } }, [], 'd1')], "m1"), new _virtualDom.VNode('marker', { latLng: [1, 2], attributes: { id: "m2" } }, [], "m2")]);

  var patches = (0, _virtualDom.diff)(firstVdom, secondVdom);
  var newRoot = (0, _virtualDom.patch)(element, patches, { render: _index.render, patch: _index.patchRecursive });
  markers = dom.getElementsByTagName('marker');
  var len = markers.length;
  t.equal(len, 2, "Second map has two markers");

  var x = undefined;
  for (var i = 0; i < markers.length; i++) {
    x = markers[i];

    console.log('blah');
    console.log(x);

    if (x.id === "m1") {
      t.deepEqual(JSON.parse(x.getAttribute('latLng')), [12, 14], "Initial marker now has updated latLng property");
    } else if (x.id === "m2") {
      t.ok(x.getAttribute('latLng'), "second marker element has latLng property");
      t.deepEqual(JSON.parse(x.getAttribute('latLng')), [1, 2], "second circleMarker element has expected latLng property");
    } else {
      t.fail();
    }
  }

  icons = dom.getElementsByTagName('divIcon');
  t.equal(icons.length, 1, "Second map has one divIcon");
  x = icons[0];
  t.deepEqual(JSON.parse(x.getAttribute('options')), { iconSize: 25, html: 'some random text' }, "Updated icon has expected options value");
  t.end();
});