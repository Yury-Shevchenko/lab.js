import { OscillatorItem } from './audio'

it('can be torn down twice', () => {
  // A component's end runs twice, and with it the timeline items' teardown
  //@ts-ignore
  const item = new OscillatorItem({})
  const disconnect = jest.fn()
  //@ts-ignore
  item.source = { disconnect }

  item.teardown()
  expect(() => item.teardown()).not.toThrow()
  expect(disconnect).toHaveBeenCalledTimes(1)
})
