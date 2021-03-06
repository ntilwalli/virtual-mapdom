'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.applyPatch = applyPatch;
exports.removeNode = removeNode;
exports.vNodePatch = vNodePatch;

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
      //throw new Error("Patch VNode called, not expected...")
      //console.log("Patch-op VNODE called.")
      return vNodePatch(domNode, vNode, patch, renderOptions);
    case _vpatch2.default.ORDER:
      // Don't do anything special with re-ordering...
      reorderChildren(domNode, patch);
      return domNode;
    case _vpatch2.default.PROPS:
      //console.log("Patch-op PROPS called.")
      return (0, _applyProperties.routePropertyChange)(domNode, vNode, patch, renderOptions);
    case _vpatch2.default.THUNK:
      throw new Error("Thunks not used in VMapDOM.");
    default:
      return domNode;
  }
}

function removeFromParentInstance(tagName, parentInstance, instance) {
  switch (tagName) {
    case 'TILELAYER':
    case 'CIRCLEMARKER':
    case 'MARKER':
    case 'LAYERGROUP':
    case 'FEATUREGROUP':
      parentInstance.removeLayer(instance);
      break;
    case 'DIVICON':
    case 'ICON':
      parentInstance.setIcon(new L.Icon.Default());
      break;
    default:
      throw new Error('Invalid tagName sent for removal: ' + tagName);
  }
}

function insertIntoParentInstance(tagName, parentInstance, instance) {
  switch (tagName) {
    case 'TILELAYER':
    case 'CIRCLEMARKER':
    case 'MARKER':
    case 'LAYERGROUP':
    case 'FEATUREGROUP':
      parentInstance.addLayer(instance);
      break;
    case 'DIVICON':
    case 'ICON':
      parentInstance.setIcon(instance);
      break;
    default:
      throw new Error('Invalid tagName sent for insertion: ' + tagName);
  }
}

function removeNode(domNode, vNode) {
  var parentNode = domNode.parentNode;

  if (parentNode) {
    var instance = domNode.instance;
    var parentInstance = parentNode.instance;
    var tagName = domNode.tagName;
    removeFromParentInstance(tagName, parentInstance, instance);
    parentNode.removeChild(domNode);
  }

  return null;
}

function insertNode(parentNode, vNode, renderOptions) {
  //if(parentNode && parentNode.tagName === 'MARKER')
  renderOptions.render(vNode, renderOptions, parentNode);
  //parentNode.appendChild(newNode);
  return parentNode;
}

function vNodePatch(domNode, leftVNode, vNode, renderOptions) {
  var parentNode = domNode.parentNode;
  var parentInstance = parentNode.instance;
  var newNode = renderOptions.render(vNode, renderOptions);

  removeFromParentInstance(domNode.tagName, parentInstance, domNode.instance);
  insertIntoParentInstance(newNode.tagName, parentInstance, newNode.instance);
  parentNode.replaceChild(newNode, domNode);
  return newNode;
}

function reorderChildren(domNode, moves) {
  var childNodes = domNode.childNodes;
  var keyMap = {};
  var node;
  var remove;
  var insert;

  for (var i = 0; i < moves.removes.length; i++) {
    remove = moves.removes[i];
    node = childNodes[remove.from];
    if (remove.key) {
      keyMap[remove.key] = node;
    }
    domNode.removeChild(node);
  }

  var length = childNodes.length;
  for (var j = 0; j < moves.inserts.length; j++) {
    insert = moves.inserts[j];
    node = keyMap[insert.key];
    // this is the weirdest bug i've ever seen in webkit
    domNode.insertBefore(node, insert.to >= length++ ? null : childNodes[insert.to]);
  }
}

// function vNodePatch (domNode, vNode, patch, renderOptions) {
//
//   const parentNode = domNode.parentNode;
//   const newNode = renderOptions.render(vNode, renderOptions);
//   if (parentNode && newNode !== domNode) {
//     const newInstance = newNode.instance
//     const oldInstance = domNode.instance
//     const parentInstance = parentNode.instance
//     const tagName = newNode.tagName
//     switch(tagName) {
//       case 'TILELAYER':
//       case 'CIRCLEMARKER':
//       case 'MARKER':
//         parentInstance.removeLayer(oldInstance)
//         parentInstance.addLayer(newInstance)
//
//         break;
//       default:
//         throw new Error('Invalid tagName sent for patch: ' + tagName)
//     }
//
//     parentNode.replaceChild(newNode, domNode);
//   }
//   return newNode;
// }