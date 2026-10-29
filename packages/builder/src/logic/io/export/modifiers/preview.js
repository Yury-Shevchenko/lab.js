import { makeFilename } from '../../filename'
import { makeDataURI } from '../../../util/dataURI'

export const addDebugPlugin = (state) => {
  // Add debug plugin to root component
  state.components.root.plugins = [
    ...state.components.root.plugins,
    {
      type: 'lab.plugins.Debug',
      filePrefix: `${ makeFilename(state) }-preview`,
    },
  ]

  return state
}

// Once the study is complete, the download plugin asks users to
// confirm before leaving the page. This script is loaded before
// the study, so that its listener runs first, and skips that
// question when the builder restarts the preview
// (which sets the flag, see PreviewWindow.reload)
const restartScript = `window.addEventListener('beforeunload', function(e) {
  if (window.labjsPreviewRestart) {
    e.stopImmediatePropagation()
  }
})
`

export const previewAssemblyOptions = {
  additionalFiles: {
    'lib/preview.js': {
      content: makeDataURI(restartScript, 'application/javascript'),
    },
  },
  headerOptions: {
    beforeHeader: [
      ['script', { src: 'lib/preview.js' }],
    ],
    dev: true, // load development build for preview
  },
}
