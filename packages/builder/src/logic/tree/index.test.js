import { children, parents, moveTargetIndex } from './index'

const testingState = {
  root: {
    children: ['A', 'B', 'C', 'D']
  },
  A: {
    children: ['A1', 'A2', 'A3']
  },
  A1: {},
  A2: {},
  A3: {},
  B: {
    children: ['B1', 'B2']
  },
  B1: {},
  B2: {},
  C: {
    children: ['C1']
  },
  C1: {
    children: ['C1x', 'C1y', 'C1z']
  },
  C1x: {},
  C1y: {},
  C1z: {},
  D: {
    children: []
  },
}

it('extracts child ids from a node', () => {
  expect(
    children('A1', testingState)
  ).toEqual([])

  expect(
    children('C', testingState)
  ).toEqual(['C1', 'C1x', 'C1y', 'C1z'])

  expect(
    children('D', testingState)
  ).toEqual([])
})

it('computes parents of a node', () => {
  expect(
    parents('root', testingState)
  ).toEqual([])

  expect(
    parents('A', testingState)
  ).toEqual(['root'])

  expect(
    parents('C1x', testingState).sort()
  ).toEqual(['C1', 'C', 'root'].sort())
})

describe('moveTargetIndex', () => {
  // A parent with the children A, B, C, D. Its gaps are numbered 0 to 4:
  // gap 0 lies before A, gap 1 between A and B, and gap 4 after D.
  const within = (oldIndex, gap) => moveTargetIndex({
    oldParent: 'root', oldIndex,
    newParent: 'root', newIndex: gap,
  })

  it('lands in the gap chosen when moving towards the end of a parent', () => {
    // B into the gap between C and D: A C B D, so B is at position 2
    expect(within(1, 3)).toEqual(2)
    // A into the gap between C and D: B C A D
    expect(within(0, 3)).toEqual(2)
    // B into the last gap: A C D B
    expect(within(1, 4)).toEqual(3)
  })

  it('keeps the index when moving towards the start of a parent', () => {
    // C into the gap between A and B: A C B D
    expect(within(2, 1)).toEqual(1)
    // D into the first gap: D A B C
    expect(within(3, 0)).toEqual(0)
  })

  it('keeps the index when moving to another parent', () => {
    expect(moveTargetIndex({
      oldParent: 'root', oldIndex: 1,
      newParent: 'A', newIndex: 3,
    })).toEqual(3)
  })
})
