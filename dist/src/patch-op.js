'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.applyPatch = applyPatch;

var _applyProperties = require('./apply-properties');

var _vpatch = require('virtual-dom/vnode/vpatch');

var _vpatch2 = _interopRequireDefault(_vpatch);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* */
function applyPatch(vpatch, domNode, renderOptions) {
  var type = vpatch.type;
  var vNode = vpatch.vNode;
  var patch = vpatch.patch;
  switch (type) {
    case _vpatch2.default.REMOVE:
      //console.log("Patch-op REMOVE called.")
      return removeNode(domNode, vNode);
    case _vpatch2.default.INSERT:
      //console.log("Patch-op INSERT called.")
      return insertNode(domNode, patch, renderOptions);
    case _vpatch2.default.VTEXT:
      throw new Error("VText not used in VMapDOM.");
    case _vpatch2.default.WIDGET:
      throw new Error("Widgets not used in VMapDOM.");
    case _vpatch2.default.VNODE:
      //console.log("Patch-op VNODE called.")
      return vNodePatch(domNode, vNode, patch, renderOptions);
    case _vpatch2.default.ORDER:
      throw new Error("Reordering not supported in VMapDOM, use explicit z-index.");
      return domNode;
    case _vpatch2.default.PROPS:
      //console.log("Patch-op PROPS called.")
      (0, _applyProperties.applyProperties)(domNode, patch, vNode.properties);
      return domNode;
    case _vpatch2.default.THUNK:
      throw new Error("Thunks not used in VMapDOM.");
    default:
      return domNode;
  }
}

function removeNode(domNode, vNode) {
  var parentNode = domNode.parentNode;

  if (parentNode) {
    var instance = domNode.instance;
    var parentInstance = parentNode.instance;
    var tagName = domNode.tagName;
    switch (tagName) {
      case 'LAYERGROUP':
      case 'TILELAYER':
      case 'CIRCLEMARKER':
        parentInstance.removeLayer(instance);
        //console.log("Removed TILELAYER or LAYERGROUP.")
        break;
      default:
        throw new Error('Invalid tagName sent for removal: ' + tagName);
    }

    parentNode.removeChild(domNode);
  }

  return null;
}

// The render function is used to generate the DOM element and attach
// the map object instance to it.  This function is applies the relationship
// between parent and child components.
function insertNode(parentNode, vNode, renderOptions) {
  var newNode = renderOptions.render(vNode, renderOptions);
  if (parentNode) {
    var instance = newNode.instance;
    var parentInstance = parentNode.instance;
    var _tagName = newNode.tagName;
    switch (_tagName) {
      case 'LAYERGROUP':
      case 'TILELAYER':
      case 'CIRCLEMARKER':
        parentInstance.addLayer(instance);
        //console.log("Added TILELAYER or LAYERGROUP.");
        break;
      default:
        throw new Error('Invalid tagName sent for insert: ' + _tagName);
    }

    parentNode.appendChild(newNode);
  }
  return parentNode;
}

function vNodePatch(domNode, leftVNode, vNode, renderOptions) {
  var parentNode = domNode.parentNode;
  var newNode = renderOptions.render(vNode, renderOptions);
  if (parentNode && newNode !== domNode) {
    var newInstance = newNode.instance;
    var oldInstance = domNode.instance;
    var parentInstance = parentNode.instance;
    switch (tagName) {
      case 'LAYERGROUP':
      case 'TILELAYER':
      case 'CIRCLEMARKER':
        parentInstance.removeLayer(oldInstance);
        parentInstance.addLayer(newInstance);
        //console.log("Patched tileLayer or layerGroup.")
        break;
      default:
        throw new Error('Invalid tagName sent for patch: ' + tagName);
    }

    parentNode.replaceChild(newNode, domNode);
  }
  return newNode;
}
