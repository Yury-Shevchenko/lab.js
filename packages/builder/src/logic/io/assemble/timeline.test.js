import { processTimeline } from './timeline'

// An item as the Timeline form saves it (Timeline/itemForm.js's defaults)
const sound = (fields = {}, payload = {}) => ({
  type: 'sound',
  start: 0,
  stop: '250',
  priority: 0,
  gain: '',
  pan: '',
  rampUp: '',
  rampDown: '',
  payload: { src: '${ this.files["error"] }', loop: false, ...payload },
  ...fields,
})

it('moves a filled gain into the payload, where lab.js reads it', () => {
  const [item] = processTimeline([sound({ gain: '0.5' })])
  expect(item.payload.gain).toBe(0.5)
  expect('gain' in item).toBe(false)
})

it('keeps a placeholder as text, for lab.js to fill in', () => {
  const gain = '${ parameters.phase === "practice" && !state.correct ? 1 : 0 }'
  const [item] = processTimeline([sound({ gain })])
  expect(item.payload.gain).toBe(gain)
})

it('moves pan and the ramps as well, and keeps start, end and source', () => {
  const [item] = processTimeline([
    sound({ pan: '-1', rampUp: '10', rampDown: '20' }),
  ])
  expect(item.payload).toEqual({
    src: '${ this.files["error"] }',
    loop: false,
    pan: -1,
    rampUp: 10,
    rampDown: 20,
  })
  expect(item.start).toBe(0)
  expect(item.stop).toBe('250')
  expect(['gain', 'pan', 'rampUp', 'rampDown'].some(k => k in item)).toBe(false)
})

it('leaves empty fields out, so the library defaults apply', () => {
  const [item] = processTimeline([sound()])
  expect(item.payload).toEqual({ src: '${ this.files["error"] }', loop: false })
})

it('keeps a payload value (an upgraded file) when the field is empty', () => {
  const [item] = processTimeline([sound({}, { gain: 0.25 })])
  expect(item.payload.gain).toBe(0.25)
})

it('lets a filled field override the payload', () => {
  const [item] = processTimeline([sound({ gain: '0' }, { gain: 0.25 })])
  expect(item.payload.gain).toBe(0)
})

it('handles oscillators and items without the form fields', () => {
  const items = processTimeline([
    { type: 'oscillator', start: 0, stop: 100, gain: '0.1',
      payload: { type: 'sine', frequency: '440', detune: '' } },
    { type: 'sound', start: 0, stop: 100, payload: { src: 'a.wav' } },
  ])
  expect(items[0].payload).toEqual({
    type: 'sine', frequency: '440', detune: '', gain: 0.1,
  })
  expect(items[1]).toEqual({
    type: 'sound', start: 0, stop: 100, payload: { src: 'a.wav' },
  })
})

it('does not change the items it is given', () => {
  const input = [sound({ gain: '1' })]
  const copy = JSON.parse(JSON.stringify(input))
  processTimeline(input)
  expect(input).toEqual(copy)
})
