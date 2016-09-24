'use strict';

var _tapeCatch = require('tape-catch');

var _tapeCatch2 = _interopRequireDefault(_tapeCatch);

var _index = require('../index');

var _mapbox = require('mapbox.js');

var _mapbox2 = _interopRequireDefault(_mapbox);

var _virtualDom = require('virtual-dom');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function jsonAttribute(node, name) {
  return JSON.parse(node.getAttribute(name));
}

(0, _tapeCatch2.default)("render map", function (assert) {
  assert.throws(function () {
    return (0, _index.render)(new _virtualDom.VNode('map'), {});
  }, 'should throw when missing \'anchorElement\' in properties');
  var element1 = document.createElement('div');
  assert.throws(function () {
    return (0, _index.render)(new _virtualDom.VNode('map', { anchorElement: element1 }, [new _virtualDom.VNode('divIcon')]));
  }, 'should throw when given unsupported child element VNode');
  var element2 = document.createElement('div');
  var vdom = new _virtualDom.VNode('map', { anchorElement: element2, centerZoom: { zoom: 7, center: [4, 5] }, maxBounds: { sw: [1, 2], ne: [3, 5] }, disablePanZoom: true, attributes: { class: 'randCN', id: 'someid' } });
  var dom = (0, _index.render)(vdom);
  assert.equal(dom instanceof Element, true, 'should be instance of Element');
  assert.equal(dom.className, 'randCN', 'should have expected className');
  assert.equal(dom.tagName, "MAP", "should have tagName 'MAP'");
  assert.ok(dom.getAttribute('centerZoom'), "should have centerZoom attribute");
  assert.ok(dom.getAttribute('maxBounds'), "should have maxBounds attribute");
  assert.ok(dom.getAttribute('disablePanZoom'), "should have disablePanZoom attribute");
  assert.deepEqual(jsonAttribute(dom, 'centerZoom'), { zoom: 7, center: [4, 5] }, "should have expected value");
  assert.equal(dom.id, "someid", "should have expected id");
  assert.ok(dom.instance, 'should have \'instance\' property');
  assert.equal(dom.instance instanceof _mapbox2.default.Map, true, "should be an L.Map");
  assert.end();
});

(0, _tapeCatch2.default)("render map with offset", function (assert) {
  assert.throws(function () {
    return (0, _index.render)(new _virtualDom.VNode('map'), {});
  }, 'should throw when missing \'anchorElement\' in properties');
  var element1 = document.createElement('div');
  assert.throws(function () {
    return (0, _index.render)(new _virtualDom.VNode('map', { anchorElement: element1 }, [new _virtualDom.VNode('divIcon')]));
  }, 'should throw when given unsupported child element VNode');
  var element2 = document.createElement('div');
  var vdom = new _virtualDom.VNode('map', { anchorElement: element2, centerZoom: { zoom: 7, center: [4, 5] }, offset: [-20, 30], maxBounds: { sw: [1, 2], ne: [3, 5] }, disablePanZoom: true, attributes: { class: 'randCN', id: 'someid' } });
  var dom = (0, _index.render)(vdom);
  assert.equal(dom instanceof Element, true, 'should be instance of Element');
  assert.equal(dom.className, 'randCN', 'should have expected className');
  assert.equal(dom.tagName, "MAP", "should have tagName 'MAP'");
  assert.deepEqual(jsonAttribute(dom, 'offset'), [-20, 30]);
  assert.ok(dom.getAttribute('centerZoom'), "should have centerZoom attribute");
  assert.ok(dom.getAttribute('maxBounds'), "should have maxBounds attribute");
  assert.ok(dom.getAttribute('disablePanZoom'), "should have disablePanZoom attribute");
  assert.deepEqual(jsonAttribute(dom, 'centerZoom'), { zoom: 7, center: [4, 5] }, "should have expected value");
  assert.equal(dom.id, "someid", "should have expected id");
  assert.ok(dom.instance, 'should have \'instance\' property');
  assert.equal(dom.instance instanceof _mapbox2.default.Map, true, "should be an L.Map");
  assert.end();
});

(0, _tapeCatch2.default)("createMapOnElement", function (assert) {
  assert.throws(function () {
    return (0, _index.createMapOnElement)();
  }, "should throw when missing required arguments");
  var element = document.createElement('div');
  assert.throws(function () {
    return (0, _index.createMapOnElement)(3, 'thing', new _virtualDom.VNode('map'));
  }, "should throw when anchorElement is not an Element");
  assert.throws(function () {
    return (0, _index.createMapOnElement)(element, 3, new _virtualDom.VNode('map'));
  }, "should throw when accessToken is not a string");
  assert.throws(function () {
    return (0, _index.createMapOnElement)(element, "thing", 3);
  }, "should throw when initialVDom is not a VNode");

  var options = { zoomControl: false };
  (0, _index.createMapOnElement)(element, 'pk.eyJ1IjoibXJyZWRlYXJzIiwiYSI6IjQtVVRTZkEifQ.ef_cKBTmj8rSr7VypppZdg', new _virtualDom.VNode('map', { options: options }));
  var dom = element.mapDOM;
  assert.ok(dom, "should create mapDOM property on element");
  assert.equal(dom instanceof Element, true, 'should be instance of Element');
  assert.equal(dom.tagName, 'MAP', 'should have tagName \'MAP\'');
  assert.ok(dom, 'should have \'instance\' property');
  assert.equal(element.mapDOM.instance instanceof _mapbox2.default.Map, true, 'should be an L.Map');
  assert.end();
});

(0, _tapeCatch2.default)("render tileLayer", function (assert) {
  assert.throws(function () {
    return (0, _index.render)(new _virtualDom.VNode('tileLayer'), {});
  }, 'should throw when missing parent element');
  var element1 = document.createElement('div');
  var invalid = new _virtualDom.VNode('map', { anchorElement: element1, centerZoom: { zoom: 7, center: [4, 5] } }, [new _virtualDom.VNode('tileLayer', {})]);
  assert.throws(function () {
    return (0, _index.render)(invalid);
  }, 'should throw when missing \'tile\' property');
  var element2 = document.createElement('div');
  var valid = new _virtualDom.VNode('map', { anchorElement: element2, centerZoom: { zoom: 7, center: [4, 5] } }, [new _virtualDom.VNode('tileLayer', { tile: 'blah', attributes: { id: 'someid' } })]);
  var rootDom = (0, _index.render)(valid);
  assert.ok(rootDom.children, "should have children");
  assert.equal(rootDom.children.length, 1, "should have one child");
  var dom = rootDom.children[0];
  assert.equal(dom.tagName, "TILELAYER", "should have tagName 'TILELAYER'");
  assert.ok(dom.getAttribute('tile'), "should have tile attribute");
  assert.equal(dom.getAttribute('tile'), "blah", "should have expected value");
  assert.deepEqual(dom.id, "someid", "should have expected id");
  assert.ok(dom.instance, 'should have \'instance\' property');
  assert.equal(dom.instance instanceof _mapbox2.default.TileLayer, true, "should be an L.TileLayer");
  assert.end();
});

(0, _tapeCatch2.default)("render circleMarker", function (assert) {
  assert.throws(function () {
    return (0, _index.render)(new _virtualDom.VNode('circleMarker'), { latLng: [4, 5], radius: 3 });
  }, 'should throw when missing parent element');
  var element1 = document.createElement('div');
  var invalid = new _virtualDom.VNode('map', { anchorElement: element1, centerZoom: { zoom: 7, center: [4, 5] } }, [new _virtualDom.VNode('circleMarker', { radius: 3 })]);
  assert.throws(function () {
    return (0, _index.render)(invalid);
  }, 'should throw when missing \'latLng\' property');
  element1 = document.createElement('div');
  invalid = new _virtualDom.VNode('map', { anchorElement: element1, centerZoom: { zoom: 7, center: [4, 5] } }, [new _virtualDom.VNode('circleMarker', { latLng: [4, 5] })]);
  assert.throws(function () {
    return (0, _index.render)(invalid);
  }, 'should throw when missing \'radius\' property');
  element1 = document.createElement('div');
  var valid = new _virtualDom.VNode('map', { anchorElement: element1, centerZoom: { zoom: 7, center: [4, 5] } }, [new _virtualDom.VNode('circleMarker', { info: { blah: 'thing' }, latLng: [4, 5], radius: 3, attributes: { id: 'someid' } })]);
  var rootDom = (0, _index.render)(valid);
  assert.ok(rootDom.children, "should have children");
  assert.equal(rootDom.children.length, 1, "should have one child");
  var dom = rootDom.children[0];
  assert.equal(dom instanceof Element, true, 'should be instance of Element');
  assert.equal(dom.tagName, 'CIRCLEMARKER', 'should have tagName \'CIRCLEMARKER\'');
  assert.ok(dom.getAttribute('latLng'), 'should have latLng attribute');
  assert.deepEqual(jsonAttribute(dom, 'latLng'), [4, 5], 'should have expected latLng value');
  assert.ok(dom.getAttribute('radius'), 'should have radius attribute');
  assert.deepEqual(jsonAttribute(dom, 'radius'), 3, "should have expected radius value");
  assert.ok(dom.instance, 'should have \'instance\' property');
  assert.equal(dom.instance instanceof _mapbox2.default.CircleMarker, true, "should be an L.CircleMarker");
  assert.deepEqual(dom.instance.mapdomInfo, { blah: 'thing' }, "should have instance with mapdomInfo property");
  assert.end();
});

(0, _tapeCatch2.default)("render marker", function (assert) {
  assert.throws(function () {
    return (0, _index.render)(new _virtualDom.VNode('marker'), { latLng: [4, 5] });
  }, 'should throw when missing parent element');
  var element1 = document.createElement('div');
  var invalid = new _virtualDom.VNode('map', { anchorElement: element1, centerZoom: { zoom: 7, center: [4, 5] } }, [new _virtualDom.VNode('marker', {})]);
  assert.throws(function () {
    return (0, _index.render)(invalid);
  }, 'should throw when missing \'latLng\' property');
  element1 = document.createElement('div');
  var valid = new _virtualDom.VNode('map', { anchorElement: element1, centerZoom: { zoom: 7, center: [4, 5] } }, [new _virtualDom.VNode('marker', { latLng: [4, 5], attributes: { id: 'someid' } })]);
  var rootDom = (0, _index.render)(valid);
  assert.ok(rootDom.children, 'should have children');
  assert.equal(rootDom.children.length, 1, 'should have one child');
  var dom = rootDom.children[0];
  assert.equal(dom instanceof Element, true, 'should be instance of Element');
  assert.equal(dom.tagName, 'MARKER', 'should have tagName \'MARKER\'');
  assert.ok(dom.getAttribute('latLng'), 'should have latLng attribute');
  assert.deepEqual(jsonAttribute(dom, 'latLng'), [4, 5], 'should have expected latLng value');
  assert.ok(dom.instance, 'should have \'instance\' property');
  assert.equal(dom.instance instanceof _mapbox2.default.Marker, true, 'should be an L.Marker');
  assert.equal(dom.instance.options.icon instanceof _mapbox2.default.Icon.Default, true, 'should be an L.Icon.Default');
  //console.log(dom.instance)
  assert.end();
});

(0, _tapeCatch2.default)("render divIcon", function (assert) {
  //assert.throws(() => render(new VNode(`divIcon`), {}), `should throw when instantiated without a marker as a parent node`)

  var element1 = document.createElement('div');
  var options = { iconSize: [60, 60], html: 'blah' };
  var invalid = new _virtualDom.VNode('map', { anchorElement: element1, centerZoom: { zoom: 7, center: [4, 5] } }, [new _virtualDom.VNode('layerGroup', {}, [new _virtualDom.VNode('divIcon', { options: options })])]);
  assert.throws(function () {
    return (0, _index.render)(invalid);
  }, 'should throw when parent is sent and is not marker');
  element1 = document.createElement('div');
  var valid = new _virtualDom.VNode('map', { anchorElement: element1, centerZoom: { zoom: 7, center: [4, 5] } }, [new _virtualDom.VNode('marker', { latLng: [4, 5] }, [new _virtualDom.VNode('divIcon', { options: options })])]);
  var rootDom = (0, _index.render)(valid);
  assert.ok(rootDom.children, 'should have one map children');
  assert.equal(rootDom.children.length, 1, 'should have one child');
  var markerDom = rootDom.children[0];
  assert.ok(markerDom.instance.options, 'should have \'options\' property on marker.instance');
  assert.ok(markerDom.instance.options.icon, 'should have \'icon\' property on marker.instance.options');
  assert.equal(markerDom.instance.options.icon instanceof _mapbox2.default.DivIcon, true, 'should be instance of L.DivIcon');
  assert.ok(markerDom.children, 'should have marker children');
  assert.equal(markerDom.children.length, 1, 'should have one child');
  var dom = markerDom.children[0];
  assert.ok(dom.instance, 'should have \'instance\' property on divIcon');
  var instance = dom.instance;
  assert.ok(instance.options, 'should have \'options\' property on instance');
  assert.equal(instance instanceof _mapbox2.default.DivIcon, true, 'should be an L.DivIcon');
  assert.deepEqual(instance.options.iconSize, options.iconSize, 'should have expected options iconSize value');
  assert.deepEqual(instance.options.html, options.html, 'should have expected options html value');

  assert.end();
});

(0, _tapeCatch2.default)("render icon", function (assert) {
  var options = {
    iconUrl: 'my-icon.png',
    iconRetinaUrl: 'my-icon@2x.png',
    iconSize: [38, 95],
    iconAnchor: [22, 94],
    popupAnchor: [-3, -76],
    shadowUrl: 'my-icon-shadow.png',
    shadowRetinaUrl: 'my-icon-shadow@2x.png',
    shadowSize: [68, 95],
    shadowAnchor: [22, 94]
  };

  var element1 = document.createElement('div');
  var invalid = new _virtualDom.VNode('map', { anchorElement: element1, centerZoom: { zoom: 7, center: [4, 5] } }, [new _virtualDom.VNode('layerGroup', {}, [new _virtualDom.VNode('icon', { options: options })])]);
  assert.throws(function () {
    return (0, _index.render)(invalid);
  }, 'should throw when parent is sent and is not marker');
  element1 = document.createElement('div');
  var valid = new _virtualDom.VNode('map', { anchorElement: element1, centerZoom: { zoom: 7, center: [4, 5] } }, [new _virtualDom.VNode('marker', { latLng: [4, 5] }, [new _virtualDom.VNode('icon', { options: options })])]);
  var rootDom = (0, _index.render)(valid);
  assert.ok(rootDom.children, 'should have one map children');
  assert.equal(rootDom.children.length, 1, 'should have one child');
  var markerDom = rootDom.children[0];
  assert.ok(markerDom.instance.options, 'should have \'options\' property on marker.instance');
  assert.ok(markerDom.instance.options.icon, 'should have \'icon\' property on marker.instance.options');
  assert.equal(markerDom.instance.options.icon instanceof _mapbox2.default.Icon, true, 'should be instance of L.Icon');
  assert.ok(markerDom.children, 'should have marker children');
  assert.equal(markerDom.children.length, 1, 'should have one child');
  var dom = markerDom.children[0];
  assert.ok(dom.instance, 'should have \'instance\' property on icon');
  var instance = dom.instance;
  assert.ok(instance.options, 'should have \'options\' property on instance');
  assert.equal(instance instanceof _mapbox2.default.Icon, true, 'should be an L.Icon');
  assert.deepEqual(instance.options.iconSize, options.iconSize, 'should have expected options iconSize value');
  assert.deepEqual(instance.options.iconUrl, options.iconUrl, 'should have expected options iconUrl value');

  assert.end();
});

(0, _tapeCatch2.default)("render layerGroup", function (assert) {
  var element1 = document.createElement('div');
  var valid = new _virtualDom.VNode('map', { anchorElement: element1, centerZoom: { zoom: 7, center: [4, 5] } }, [new _virtualDom.VNode('layerGroup', { attributes: { id: 'someid' } })]);
  var rootDom = (0, _index.render)(valid);
  assert.ok(rootDom.children, "should have children");
  assert.equal(rootDom.children.length, 1, "should have one child");
  var dom = rootDom.children[0];
  assert.equal(dom.tagName, 'LAYERGROUP', 'should have tagName \'LAYERGROUP\'');
  assert.deepEqual(dom.id, "someid", 'should have expected id');
  assert.ok(dom.instance, 'should have \'instance\' property');
  assert.equal(dom.instance instanceof _mapbox2.default.LayerGroup, true, 'should be an L.LayerGroup');
  assert.end();
});

(0, _tapeCatch2.default)("render featureGroup", function (assert) {
  var element1 = document.createElement('div');
  var valid = new _virtualDom.VNode('map', { anchorElement: element1, centerZoom: { zoom: 7, center: [4, 5] } }, [new _virtualDom.VNode('featureGroup', { attributes: { id: 'someid' } })]);
  var rootDom = (0, _index.render)(valid);
  assert.ok(rootDom.children, 'should have children');
  assert.equal(rootDom.children.length, 1, 'should have one child');
  var dom = rootDom.children[0];
  assert.equal(dom.tagName, 'FEATUREGROUP', 'should have tagName \'FEATUREGROUP\'');
  assert.deepEqual(dom.id, 'someid', 'should have expected id');
  assert.ok(dom.instance, 'should have \'instance\' property');
  assert.equal(dom.instance instanceof _mapbox2.default.FeatureGroup, true, 'should be an L.FeatureGroup');
  assert.end();
});

(0, _tapeCatch2.default)("patch map", function (assert) {
  var element1 = document.createElement('div');
  var vdom = new _virtualDom.VNode('map', { anchorElement: element1, centerZoom: { zoom: 7, center: [4, 5] }, attributes: { id: 'someid' } }, [], 'test');
  var dom = (0, _index.render)(vdom);
  assert.deepEqual(jsonAttribute(dom, 'centerZoom'), { zoom: 7, center: [4, 5] }, 'should have expected centerZoom value');
  var newvdom = new _virtualDom.VNode('map', { anchorElement: element1, centerZoom: { zoom: 8, center: [6, 5] }, attributes: { id: 'someid' } }, [new _virtualDom.VNode('tileLayer', { tile: 'blah', attributes: { id: 'someid2' } })], 'test');
  var patches = (0, _virtualDom.diff)(vdom, newvdom);
  var newDom = (0, _virtualDom.patch)(dom, patches, { render: _index.render, patch: _index.patchRecursive });
  assert.deepEqual(jsonAttribute(dom, 'centerZoom'), { zoom: 8, center: [6, 5] }, 'should have updated centerZoom value');
  assert.equal(dom, newDom, 'should return same root dom element reference');
  assert.equal(dom.children.length, 1, 'should have one child');
  var newvdom2 = new _virtualDom.VNode('map', { anchorElement: element1, centerZoom: { zoom: 8, center: [6, 5] }, attributes: { id: 'someid' } }, [new _virtualDom.VNode('circleMarker', { latLng: [4, 5], radius: 5, attributes: { id: 'someid3' } })], 'test');
  patches = (0, _virtualDom.diff)(newvdom, newvdom2);
  var newDom2 = (0, _virtualDom.patch)(newDom, patches, { render: _index.render, patch: _index.patchRecursive });
  assert.equal(dom.children.length, 1, 'should have one child');
  assert.end();
});

(0, _tapeCatch2.default)("patch tileLayer", function (assert) {
  var element1 = document.createElement('div');
  var vdom = new _virtualDom.VNode('map', { anchorElement: element1, centerZoom: { zoom: 7, center: [4, 5] } }, [new _virtualDom.VNode('tileLayer', { tile: 'blah', attributes: { id: 'someid' } }, [])]);
  var rootDom = (0, _index.render)(vdom);
  var dom = rootDom.children[0];
  assert.equal(dom.getAttribute('tile'), 'blah', 'should have expected tile value');
  assert.equal(dom.id, 'someid', 'should have expected element id ');
  var newvdom = new _virtualDom.VNode('map', { anchorElement: element1, centerZoom: { zoom: 7, center: [4, 5] } }, [new _virtualDom.VNode('tileLayer', { tile: 'notblah', attributes: { id: 'someid' } }, [])]);
  var patches = (0, _virtualDom.diff)(vdom, newvdom);
  (0, _virtualDom.patch)(rootDom, patches, { render: _index.render, patch: _index.patchRecursive });
  dom = rootDom.children[0];
  assert.equal(dom.getAttribute('tile'), 'notblah', 'should have updated tile value');
  assert.equal(dom.id, 'someid', 'should have same element id');
  assert.end();
});

(0, _tapeCatch2.default)("patch circleMarker", function (assert) {
  var element1 = document.createElement('div');
  var vdom = new _virtualDom.VNode('map', { anchorElement: element1, centerZoom: { zoom: 7, center: [4, 5] } }, [new _virtualDom.VNode('circleMarker', { latLng: [4, 5], radius: 3, attributes: { id: 'someid' } }, [])]);
  var rootDom = (0, _index.render)(vdom);
  var dom = rootDom.children[0];
  assert.deepEqual(jsonAttribute(dom, 'latLng'), [4, 5], 'should have expected latLng value');
  assert.equal(jsonAttribute(dom, 'radius'), 3, 'should have expected radius value');
  assert.equal(dom.id, 'someid', 'should have expected element id ');
  var newvdom = new _virtualDom.VNode('map', { anchorElement: element1, centerZoom: { zoom: 7, center: [4, 5] } }, [new _virtualDom.VNode('circleMarker', { latLng: [4, 6], radius: 4, attributes: { id: 'someid' } }, [])]);
  var patches = (0, _virtualDom.diff)(vdom, newvdom);
  var newDom = (0, _virtualDom.patch)(rootDom, patches, { render: _index.render, patch: _index.patchRecursive });
  assert.deepEqual(jsonAttribute(dom, 'latLng'), [4, 6], 'should have updated latLng value');
  assert.equal(jsonAttribute(dom, 'radius'), 4, 'should have updated radius value');
  assert.equal(dom.id, 'someid', 'should have same element id');
  assert.end();
});

(0, _tapeCatch2.default)("patch marker", function (assert) {
  var element1 = document.createElement('div');
  var vdom = new _virtualDom.VNode('map', { anchorElement: element1, centerZoom: { zoom: 7, center: [4, 5] } }, [new _virtualDom.VNode('marker', { latLng: [4, 5], attributes: { id: 'someid' } }, [])]);
  var rootDom = (0, _index.render)(vdom);
  var dom = rootDom.children[0];
  assert.deepEqual(jsonAttribute(dom, 'latLng'), [4, 5], 'should have expected latLng value');
  assert.equal(dom.id, 'someid', 'should have expected element id ');
  assert.equal(dom.instance.options.icon instanceof _mapbox2.default.Icon.Default, true, 'should be an L.Icon.Default');
  var newvdom = new _virtualDom.VNode('map', { anchorElement: element1, centerZoom: { zoom: 7, center: [4, 5] } }, [new _virtualDom.VNode('marker', { latLng: [7, 6], attributes: { id: 'someid' } }, [])]);
  var patches = (0, _virtualDom.diff)(vdom, newvdom);
  var newDom = (0, _virtualDom.patch)(rootDom, patches, { render: _index.render, patch: _index.patchRecursive });
  assert.deepEqual(jsonAttribute(dom, 'latLng'), [7, 6], 'should have updated latLng value');
  assert.equal(dom.id, 'someid', 'should have same element id');
  assert.equal(dom.instance.options.icon instanceof _mapbox2.default.Icon.Default, true, 'should still be an L.Icon.Default');
  assert.end();
});

(0, _tapeCatch2.default)("patch marker w/ divIcon", function (assert) {
  var options = { iconSize: [60, 60], html: 'blah' };
  var element1 = document.createElement('div');
  var vdom = new _virtualDom.VNode('map', { anchorElement: element1, centerZoom: { zoom: 7, center: [4, 5] } }, [new _virtualDom.VNode('marker', { latLng: [4, 5], attributes: { id: 'someid' } }, [])]);
  var rootDom = (0, _index.render)(vdom);
  var dom = rootDom.children[0];
  assert.deepEqual(jsonAttribute(dom, 'latLng'), [4, 5], 'should have expected latLng value');
  assert.equal(dom.id, 'someid', 'should have expected element id ');
  assert.equal(dom.instance.options.icon instanceof _mapbox2.default.Icon.Default, true, 'should be an L.Icon.Default');
  var newvdom = new _virtualDom.VNode('map', { anchorElement: element1, centerZoom: { zoom: 7, center: [4, 5] } }, [new _virtualDom.VNode('marker', { latLng: [7, 6], attributes: { id: 'someid' } }, [new _virtualDom.VNode('divIcon', { options: options })])]);
  var patches = (0, _virtualDom.diff)(vdom, newvdom);
  var newDom = (0, _virtualDom.patch)(rootDom, patches, { render: _index.render, patch: _index.patchRecursive });
  assert.deepEqual(jsonAttribute(dom, 'latLng'), [7, 6], 'should have updated latLng value');
  assert.equal(dom.id, 'someid', 'should have same element id');
  assert.equal(dom.instance.options.icon instanceof _mapbox2.default.DivIcon, true, 'should now be an L.DivIcon');
  assert.end();
});

(0, _tapeCatch2.default)("patch marker w/ icon", function (assert) {
  var options = {
    iconUrl: 'my-icon.png',
    iconRetinaUrl: 'my-icon@2x.png',
    iconSize: [38, 95],
    iconAnchor: [22, 94],
    popupAnchor: [-3, -76],
    shadowUrl: 'my-icon-shadow.png',
    shadowRetinaUrl: 'my-icon-shadow@2x.png',
    shadowSize: [68, 95],
    shadowAnchor: [22, 94]
  };
  var element1 = document.createElement('div');
  var vdom = new _virtualDom.VNode('map', { anchorElement: element1, centerZoom: { zoom: 7, center: [4, 5] } }, [new _virtualDom.VNode('marker', { latLng: [4, 5], attributes: { id: 'someid' } }, [])]);
  var rootDom = (0, _index.render)(vdom);
  var dom = rootDom.children[0];
  assert.deepEqual(jsonAttribute(dom, 'latLng'), [4, 5], 'should have expected latLng value');
  assert.equal(dom.id, 'someid', 'should have expected element id ');
  assert.equal(dom.instance.options.icon instanceof _mapbox2.default.Icon.Default, true, 'should be an L.Icon.Default');
  var newvdom = new _virtualDom.VNode('map', { anchorElement: element1, centerZoom: { zoom: 7, center: [4, 5] } }, [new _virtualDom.VNode('marker', { latLng: [7, 6], attributes: { id: 'someid' } }, [new _virtualDom.VNode('icon', { options: options })])]);
  var patches = (0, _virtualDom.diff)(vdom, newvdom);
  var newDom = (0, _virtualDom.patch)(rootDom, patches, { render: _index.render, patch: _index.patchRecursive });
  assert.deepEqual(jsonAttribute(dom, 'latLng'), [7, 6], 'should have updated latLng value');
  assert.equal(dom.id, 'someid', 'should have same element id');
  assert.equal(dom.instance.options.icon instanceof _mapbox2.default.Icon, true, 'should now be an L.Icon');
  assert.deepEqual(dom.instance.options.icon.options.iconSize, options.iconSize, 'should have expected options iconSize value');
  assert.deepEqual(dom.instance.options.icon.options.iconUrl, options.iconUrl, 'should have expected options iconUrl value');
  assert.end();
});

(0, _tapeCatch2.default)("patch marker w/ icon options change", function (assert) {
  var options = {
    iconUrl: 'my-icon.png',
    iconRetinaUrl: 'my-icon@2x.png',
    iconSize: [38, 95],
    iconAnchor: [22, 94],
    popupAnchor: [-3, -76],
    shadowUrl: 'my-icon-shadow.png',
    shadowRetinaUrl: 'my-icon-shadow@2x.png',
    shadowSize: [68, 95],
    shadowAnchor: [22, 94]
  };
  var element1 = document.createElement('div');
  var vdom = new _virtualDom.VNode('map', { anchorElement: element1, centerZoom: { zoom: 7, center: [4, 5] } }, [new _virtualDom.VNode('marker', { latLng: [4, 5], attributes: { id: 'someid' } }, [new _virtualDom.VNode('icon', { options: options })])]);
  var rootDom = (0, _index.render)(vdom);
  var dom = rootDom.children[0];
  assert.deepEqual(jsonAttribute(dom, 'latLng'), [4, 5], 'should have expected latLng value');
  assert.equal(dom.id, 'someid', 'should have expected element id ');
  assert.equal(dom.instance.options.icon instanceof _mapbox2.default.Icon, true, 'should be an L.Icon');
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
  };
  var newvdom = new _virtualDom.VNode('map', { anchorElement: element1, centerZoom: { zoom: 7, center: [4, 5] } }, [new _virtualDom.VNode('marker', { latLng: [4, 5], attributes: { id: 'someid' } }, [new _virtualDom.VNode('icon', { options: options })])]);
  var patches = (0, _virtualDom.diff)(vdom, newvdom);
  var newDom = (0, _virtualDom.patch)(rootDom, patches, { render: _index.render, patch: _index.patchRecursive });
  assert.deepEqual(jsonAttribute(dom, 'latLng'), [4, 5], 'should have updated latLng value');
  assert.equal(dom.id, 'someid', 'should have same element id');
  assert.equal(dom.instance.options.icon instanceof _mapbox2.default.Icon, true, 'should now be an L.Icon');
  assert.deepEqual(dom.instance.options.icon.options.iconSize, options.iconSize, 'should have same options iconSize value');
  assert.deepEqual(dom.instance.options.icon.options.iconUrl, 'blah', 'should have updated options iconUrl value');
  assert.end();
});

(0, _tapeCatch2.default)("patch featureGroup", function (assert) {
  var element1 = document.createElement('div');
  var vdom = new _virtualDom.VNode('map', { anchorElement: element1, centerZoom: { zoom: 7, center: [4, 5] } }, [new _virtualDom.VNode('featureGroup', { style: { color: '#345' }, attributes: { id: 'someid' } }, [])]);
  var rootDom = (0, _index.render)(vdom);
  var dom = rootDom.children[0];
  assert.deepEqual(jsonAttribute(dom, 'style'), { color: '#345' }, 'should have expected style value');
  assert.equal(dom.id, 'someid', 'should have expected element id ');
  var newvdom = new _virtualDom.VNode('map', { anchorElement: element1, centerZoom: { zoom: 7, center: [4, 5] } }, [new _virtualDom.VNode('featureGroup', { style: { color: '#327' }, attributes: { id: 'someid' } }, [])]);
  var patches = (0, _virtualDom.diff)(vdom, newvdom);
  var newDom = (0, _virtualDom.patch)(rootDom, patches, { render: _index.render, patch: _index.patchRecursive });
  assert.deepEqual(jsonAttribute(dom, 'style'), { color: '#327' }, 'should have updated style value');
  assert.equal(dom.id, 'someid', 'should have same element id');
  assert.end();
});