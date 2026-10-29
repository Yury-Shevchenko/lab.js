import { stateToJSON } from './save'

const testingState = {
  version: [23, 0, 0, 'alpha', 9],
  components: {
    root: {
      children: ['A'],
      _tab: 'Behavior',
    },
    A: {
      type: 'lab.html.Screen',
      children: [],
      _tab: 'Scripts',
      _collapsed: true,
      _template: true,
    },
  },
  files: {
    files: {},
    bundledFiles: {},
  },
}

it('never saves the last open tab', () => {
  const { components } = JSON.parse(stateToJSON(testingState))

  expect(components.root).not.toHaveProperty('_tab')
  expect(components.A).not.toHaveProperty('_tab')
})

it('keeps other internal options unless asked to remove them', () => {
  const { components } = JSON.parse(stateToJSON(testingState))
  expect(components.A).toMatchObject({ _collapsed: true, _template: true })

  const { components: withoutInternals } = JSON.parse(
    stateToJSON(testingState, 'root', { removeInternals: true })
  )
  expect(withoutInternals.A).not.toHaveProperty('_collapsed')
  expect(withoutInternals.A).not.toHaveProperty('_template')
})

it('leaves the state itself unchanged', () => {
  stateToJSON(testingState)
  expect(testingState.components.A._tab).toBe('Scripts')
})
