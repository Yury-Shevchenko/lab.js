import { Component } from './component'
import { Timeline } from './timeline'
import { setupTestingContext } from './test/helpers'

// The timeline needs Web Audio, which the test environment does not provide,
// so it is replaced by a mock that records what it receives.
jest.mock('./timeline')

setupTestingContext()

beforeEach(() => {
  ;(Timeline as jest.Mock).mockClear()
})

it('passes timeline items to the timeline with placeholders filled in', async () => {
  const c = new Component({
    files: { 'error.wav': 'https://example.org/error.wav' },
    parameters: { volume: 0.5 },
    // As the builder saves a Sound file chosen with its file button
    timeline: [
      {
        type: 'sound',
        start: 0,
        stop: 100,
        priority: 0,
        payload: {
          src: '${ this.files["error.wav"] }',
          gain: '${ parameters.volume }',
          loop: false,
        },
      },
    ] as any,
  })
  await c.prepare()

  expect(Timeline).toHaveBeenCalledTimes(1)
  const items = (Timeline as jest.Mock).mock.calls[0][1]
  expect(items[0].payload.src).toEqual('https://example.org/error.wav')
  expect(items[0].payload.gain).toEqual(0.5)
})
