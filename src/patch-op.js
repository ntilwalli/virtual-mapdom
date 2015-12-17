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
      //throw new Error("Patch VNode called, not expected...")
      //console.log("Patch-op VNODE called.")
      return vNodePatch(domNode, vNode, patch, renderOptions);
    case VPatch.ORDER:
      // Don't do anything special with re-ordering...
      return domNode;
    case VPatch.PROPS:
      //console.log("Patch-op PROPS called.")
      return routePropertyChange(domNode, vNode, patch, renderOptions)
    case VPatch.THUNK:
      throw new Error("Thunks not used in VMapDOM.")
    default:
      return domNode;
  }
}

export function removeNode(domNode, vNode) {
  var parentNode = domNode.parentNode

  if (parentNode) {
    var instance = domNode.instance
    var parentInstance = parentNode.instance
    var tagName = domNode.tagName
    switch(tagName) {
      case 'TILELAYER':
      case 'CIRCLEMARKER':
      case 'MARKER':
      case 'LAYERGROUP':
      case 'FEATUREGROUP':
        console.log('Removing layer...')
        parentInstance.removeLayer(instance)
        break;
      case 'DIVICON':
      case 'ICON':
        parentInstance.setIcon(new L.Icon.Default())
        break
      default:
        throw new Error('Invalid tagName sent for removal: ' + tagName)
    }

    parentNode.removeChild(domNode);
  }

  return null;
}

function insertNode(parentNode, vNode, renderOptions) {
  let newNode = renderOptions.render(vNode, renderOptions, parentNode);
  //parentNode.appendChild(newNode);
  return parentNode;
}

function vNodePatch(domNode, leftVNode, vNode, renderOptions) {
    // console.log(domNode)
    // console.log(leftVNode)
    // console.log(vNode)
    let parentNode = domNode.parentNode
    removeNode(domNode, leftVNode)
    let newNode = renderOptions.render(vNode, renderOptions, parentNode)

    // if (parentNode && newNode !== domNode) {
    //     parentNode.replaceChild(newNode, domNode)
    // }

    return newNode
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
