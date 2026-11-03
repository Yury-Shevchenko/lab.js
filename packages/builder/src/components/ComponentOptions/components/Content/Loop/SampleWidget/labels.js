// The label of the draw-shuffle mode depends on the sample size. A placeholder
// has no size yet while the study is being edited, so it can't be compared to
// the rows; it is a sample like any other, and only an empty field means "all".
export const switchLabels = ({
  templateParameters={ rows: [] },
  sample={ n: undefined }
}, labels) => {
  const samples = parseInt(sample.n)
  const parameters = templateParameters.rows.length
  const isEmpty = sample.n === undefined || `${ sample.n }`.trim() === ''

  if (samples < parameters) {
    return labels[0]
  } else if (isEmpty || samples === parameters) {
    return labels[1]
  } else {
    return labels[2]
  }
}
