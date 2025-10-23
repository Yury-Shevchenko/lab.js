import { setupTestingContext } from './test/helpers'

import { Screen } from '../html'
import { Sequence } from '../flow'
import { Component } from './component'

setupTestingContext()

const treeDepth = 5
const nodeWidth = 5

const createTree = (level: number, prefix: string): Component[] => {
  if (level < treeDepth) {
    return new Array(nodeWidth).fill(undefined).map(
      (_, i) =>
        new Sequence({
          id: `${prefix}${i}`,
          content: createTree(level + 1, `${prefix}${i}`),
          shuffle: true,
        }),
    )
  } else {
    return new Array(nodeWidth).fill(undefined).map(
      (_, i) =>
        new Screen({
          id: `${prefix}${i}`,
        }),
    )
  }
}

it('retains seed in deeply nested structures', async () => {
  for (let i = 0; i < 5; i++) {
    await (async () => {
      const parent = new Sequence({
        id: 'p',
        content: createTree(0, 'p'),
        random: {
          algorithm: 'alea',
          seed: 'I, at any rate, am convinced that He does not throw dice.',
        },
      })

      await parent.run()
      expect(parent.internals.controller.currentStack.map(c => c.id)) //
        .toStrictEqual([
          'p',
          'p0', // <- sequential order guaranteed until here
          'p03',
          'p030',
          'p0303',
          'p03032',
          'p030320',
        ])
    })()
  }
})
