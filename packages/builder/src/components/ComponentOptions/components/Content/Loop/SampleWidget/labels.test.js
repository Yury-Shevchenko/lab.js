import { switchLabels } from './labels'

const labels = ['fewer', 'all', 'more']
const rows = (n) => ({ rows: new Array(n).fill(['x']) })
const label = (n, rowCount = 2) => switchLabels({
  templateParameters: rows(rowCount),
  sample: { n },
}, labels)

it('uses the label for fewer samples than rows', () => {
  expect(label('1')).toEqual('fewer')
})

it('uses the label for all rows when the size is empty or equals the rows', () => {
  expect(label(undefined)).toEqual('all')
  expect(label('')).toEqual('all')
  expect(label('2')).toEqual('all')
})

it('uses the label for more samples than rows', () => {
  expect(label('8')).toEqual('more')
})

it('does not read a placeholder as an empty size', () => {
  expect(label('${ parameters.n }')).toEqual('more')
  expect(label('${ 8 * Number(parameters.n) }')).toEqual('more')
})
