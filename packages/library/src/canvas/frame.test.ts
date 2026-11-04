import { Frame } from './frame'
import { Screen } from './screen'
import { defaultParser } from '../base/util/parse'

it('fills in placeholders in the context, as the HTML frame does', () => {
  const context = '<canvas></canvas><footer>${ parameters.reminder }</footer>'
  const frame = new Frame({ context, content: new Screen() })
  const parsed = defaultParser.parseAll(
    { context },
    { parameters: { reminder: 'Press F' } },
    defaultParser.parsableOptions(frame),
    {},
  )
  expect(parsed.context).toEqual('<canvas></canvas><footer>Press F</footer>')
})
