import { placeholderParameters, undefinedParameters } from './placeholders'

describe('placeholderParameters', () => {
  it('finds the names a placeholder reads', () => {
    expect(placeholderParameters('${ parameters.duration }')).toEqual(['duration'])
    expect(placeholderParameters('${ this.parameters._a }')).toEqual(['_a'])
    expect(placeholderParameters('${ parameters["b"] }')).toEqual(['b'])
    expect(placeholderParameters("${ 8 * Number(parameters.c) }")).toEqual(['c'])
    expect(placeholderParameters('${ parameters.d + parameters.e }')).toEqual(['d', 'e'])
  })

  it('ignores anything outside a placeholder', () => {
    expect(placeholderParameters('500')).toEqual([])
    expect(placeholderParameters('')).toEqual([])
    expect(placeholderParameters(undefined)).toEqual([])
    expect(placeholderParameters('parameters.a')).toEqual([])
    expect(placeholderParameters('${ state.correct ? 500 : 1000 }')).toEqual([])
  })
})

describe('undefinedParameters', () => {
  const components = {
    root: {
      children: ['seq'],
      parameters: [],
    },
    seq: {
      children: ['loop'],
      parameters: [{ name: '_fixation_duration', value: '500', type: 'string' }],
    },
    loop: {
      children: ['screen'],
      parameters: [{ name: '', value: '', type: 'string' }],
      templateParameters: {
        columns: [{ name: 'trial_type', type: 'string' }],
        rows: [['blue']],
      },
    },
    screen: {
      parameters: [{ name: 'own', value: '1', type: 'string' }],
    },
    sibling: {
      parameters: [{ name: 'elsewhere', value: '1', type: 'string' }],
      hooks: [{ title: '', message: 'before:prepare', code: 'this.parameters.fromScript = 200' }],
    },
  }
  const check = (text, id = 'screen') => undefinedParameters(text, id, components)

  it('accepts parameters on the component and around it', () => {
    expect(check('${ parameters.own }')).toEqual([])
    expect(check('${ parameters._fixation_duration }')).toEqual([])
    expect(check('${ parameters.trial_type }')).toEqual([])
  })

  it('reports a mistyped name', () => {
    expect(check('${ parameters._fixation_durration }'))
      .toEqual(['_fixation_durration'])
  })

  it('reports a parameter defined only on an unrelated component', () => {
    expect(check('${ parameters.elsewhere }')).toEqual(['elsewhere'])
  })

  it('accepts a parameter that a script sets', () => {
    expect(check('${ parameters.fromScript }')).toEqual([])
  })

  it('accepts names that Open Lab assigns at run time', () => {
    expect(check('${ parameters.openlab_group_code }')).toEqual([])
  })

  it('finds definitions on every parent of a cloned component', () => {
    const cloned = {
      a: { children: ['screen'], parameters: [{ name: 'x', value: '1' }] },
      b: { children: ['screen'], parameters: [{ name: 'y', value: '1' }] },
      screen: {},
    }
    expect(undefinedParameters('${ parameters.x + parameters.y }', 'screen', cloned))
      .toEqual([])
  })

  it('leaves plain numbers and empty fields alone', () => {
    expect(check('500')).toEqual([])
    expect(check('')).toEqual([])
    expect(check(undefined)).toEqual([])
  })
})
