import {domIndex} from './dom-index'
import {applyPatch as patchOp} from './patch-op'

export function patchRecursive(rootNode, patches, renderOptions) {
  //console.log('Called patchRecursive...')

  //let rootNode = proxyElement.mapDOM

  //console.dir(rootNode)
  var indices = patchIndices(patches);
  if (indices.length === 0) {
    return rootNode;
  }
  var index = domIndex(rootNode, patches.a, indices);
  var ownerDocument = rootNode.ownerDocument;
  if (!renderOptions.document && ownerDocument !== document) {
    renderOptions.document = ownerDocument;
  }

  for (var i = 0; i < indices.length; i++) {
    var nodeIndex = indices[i];
    rootNode = applyPatch(rootNode, index[nodeIndex], patches[nodeIndex], renderOptions);
  }

  return rootNode;
}

function applyPatch(rootNode, domNode, patchList, renderOptions) {
  //console.log("applyPatch called...")
  if (!domNode) {
    return rootNode;
  }
  var newNode;

  if (Array.isArray(patchList)) {
    for (var i = 0; i < patchList.length; i++) {

      newNode = patchOp(patchList[i], domNode, renderOptions);

      if (domNode === rootNode) {
        rootNode = newNode;
      }
    }
  } else {
    newNode = patchOp(patchList, domNode, renderOptions);
    if (domNode === rootNode) {
      rootNode = newNode;
    }
  }

  return rootNode;
}
function patchIndices(patches) {

  var indices = [];
  for (var key in patches) {
    if (key !== "a") {
      indices.push(Number(key));
    }
  }
  return indices;
}
