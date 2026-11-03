
export const children = (id, tree) => {
  const data = tree[id]
  if (data.children && Array.isArray(data.children)) {
    const nestedIds = data.children.map(c => children(c, tree))
    return data.children.concat(...nestedIds)
  } else {
    return []
  }
}

export const parents = (target, tree) => {
  const immediateParents = Object.entries(tree)
    .filter(
      ([id, data]) =>
        data.children && Array.isArray(data.children) &&
        data.children.includes(target)
    ).map(
      ([id, data]) => id
    )

  return immediateParents.concat(
    ...immediateParents.map(n => parents(n, tree))
  )
}

// A drop target's index counts the gaps of its parent during the drag, with
// the dragged component still in place. MOVE_COMPONENT expects the position
// after that component has been taken out. So a move towards the end of the
// same parent ends up one position before the number of the gap.
export const moveTargetIndex = ({ oldParent, oldIndex, newParent, newIndex }) =>
  oldParent === newParent && newIndex > oldIndex
    ? newIndex - 1
    : newIndex

// Generate flat representation of tree,
// alongside some component metadata
export const flatTree = (tree, id='root', level=0) => {
  const output = []
  if (tree[id].children) {
    tree[id].children.forEach(
      c => output.push(
        [ c, level, tree[c] ],
        ...flatTree(tree, c, level + 1)
      )
    )
  }
  return output
}
