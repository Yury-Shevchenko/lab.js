// The Timeline form saves a sound's or an oscillator's gain, pan and ramps next
// to its start and end (timeline[i].gain, …: see the Behavior tab's
// Timeline/itemForm.js), but lab.js reads them from the item's payload
// (library: core/timeline/index.ts passes `payload` to the item, and
// core/timeline/items/audio.ts reads `this.payload.gain`), which is also where
// files upgraded from lab.js 19.0.0 keep them (logic/io/upgrade.js). Left where
// the form puts them, the four fields have no effect.
//
// So the study script carries them in the payload: a filled field overrides
// the payload's value, an empty field leaves it (and the library's default:
// gain 1, pan 0, no ramps). A plain number becomes a number; anything else,
// such as a placeholder, stays text for lab.js to fill in and convert.
const payloadSettings = ['gain', 'pan', 'rampUp', 'rampDown']

const isEmpty = value =>
  value === undefined || value === null ||
  (typeof value === 'string' && value.trim() === '')

const asNumber = value =>
  typeof value === 'string' && /^\s*-?(\d+\.?\d*|\.\d+)\s*$/.test(value)
    ? Number(value)
    : value

export const processTimeline = timeline =>
  timeline.map(item => {
    const output = { ...item, payload: { ...(item.payload || {}) } }
    payloadSettings.forEach(key => {
      if (!(key in output)) return
      const value = output[key]
      delete output[key]
      if (!isEmpty(value)) {
        output.payload[key] = asNumber(value)
      }
    })
    return output
  })
