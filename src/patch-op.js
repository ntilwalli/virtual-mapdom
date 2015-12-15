/* */
import {applyProperties, routePropertyChange} from './apply-properties'
import VPatch from 'virtual-dom/vnode/vpatch'

export function applyPatch(vpatch, domNode, renderOptions) {

  var type = vpatch.type;
  var vNode = vpatch.vNode;
  var patch = vpatch.patch;
  switch (type) {
    case VPatch.REMOVE:
      //console.log("Patch-op REMOVE called.")
      return removeNode(domNode, vNode);
    case VPatch.INSERT:
      //console.log("Patch-op INSERT called.")
      return insertNode(domNode, patch, renderOptions);
    case VPatch.VTEXT:
      throw new Error("VText not used in VMapDOM.")
    case VPatch.WIDGET:
      throw new Error("Widgets not used in VMapDOM.")
    case VPatch.VNODE:
      throw new Error("Patch VNode called, not expected...")
      //console.log("Patch-op VNODE called.")
      //return vNodePatch(domNode, vNode, patch, renderOptions);
    case VPatch.ORDER:
      // Don't do anything special with re-ordering...
      return domNode;
    case VPatch.PROPS:
      //console.log("Patch-op PROPS called.")
      routePropertyChange(domNode, vNode, patch, renderOptions)
      return domNode;
    case VPatch.THUNK:
      throw new Error("Thunks not used in VMapDOM.")
    default:
      return domNode;
  }
}

function removeNode(domNode, vNode) {
  var parentNode = domNode.parentNode

  if (parentNode) {
    var instance = domNode.instance
    var parentInstance = parentNode.instance
    var tagName = domNode.tagName
    switch(tagName) {
      case 'LAYERGROUP':
      case 'TILELAYER':
      case 'CIRCLEMARKER':
        parentInstance.removeLayer(instance)
        //console.log("Removed TILELAYER or LAYERGROUP.")
        break;
      default:
        throw new Error('Invalid tagName sent for removal: ' + tagName)
    }

    parentNode.removeChild(domNode);
  }

  return null;
}

function isLayerGroup(node) {
  return node.tagName === 'LAYERGROUP'
}

function isMap(node) {
  return node.tagName === 'MAP'
}

function isCircleMarker(node) {
  return node.tagName === 'CIRCLEMARKER'
}


function insertNode(parentNode, vNode, renderOptions) {
  var newNode = renderOptions.render(vNode, renderOptions);
  if (parentNode) {
    const instance = newNode.instance
    const parentInstance = parentNode.instance
    const tagName = newNode.tagName
    switch(tagName) {
      case 'LAYERGROUP':
        if(isMap(parentNode) || isLayerGroup(parentNode)) {
          parentInstance.addLayer(instance)
        } else {
          throw new Error("layerGroup must be child of map or layerGroup")
        }
        break
      case 'TILELAYER':
        if(isMap(parentNode) || isLayerGroup(parentNode)) {
          parentInstance.addLayer(instance)
        } else {
          throw new Error("tileLayer must be child of map or layerGroup")
        }
        break
      case 'CIRCLEMARKER':


        if(isMap(parentNode) || isLayerGroup(parentNode)) {

          parentInstance.addLayer(instance)
        } else {

          throw new Error("circleMarker must be child of map or layerGroup")
        }
        break
      default:
        throw new Error('Invalid tagName sent for insert: ' + tagName)
    }

    parentNode.appendChild(newNode);
  }
  return parentNode;
}

function vNodePatch (domNode, vNode, patch, renderOptions) {

  const parentNode = domNode.parentNode;
  const newNode = renderOptions.render(vNode, renderOptions);
  if (parentNode && newNode !== domNode) {
    const newInstance = newNode.instance
    const oldInstance = domNode.instance
    const parentInstance = parentNode.instance
    const tagName = newNode.tagName
    switch(tagName) {
      case 'LAYERGROUP':
      case 'TILELAYER':
      case 'CIRCLEMARKER':
        parentInstance.removeLayer(oldInstance)
        parentInstance.addLayer(newInstance)

        break;
      default:
        throw new Error('Invalid tagName sent for patch: ' + tagName)
    }

    parentNode.replaceChild(newNode, domNode);
  }
  return newNode;
}
