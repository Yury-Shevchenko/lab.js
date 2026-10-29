import React, { Component } from 'react'
import { ReactReduxContext } from 'react-redux'

import Icon from '../../../Icon'

import { stateToJSON } from '../../../../logic/io/save'

class OpenLabWidget extends Component {
  static contextType = ReactReduxContext

  constructor() {
    super()
    this.state = {
      widgetState: 'dormant'
    }
  }

  async submit() {
    this.setState({ widgetState: 'submitting' })

    const state = this.context.store.getState()
    const stateJSON = stateToJSON(state)

    // Open Lab accepts study JSON up to 100 MB. Warn clearly and abort before
    // uploading anything larger, rather than letting the server 413.
    const MAX_JSON_BYTES = 100 * 1024 * 1024
    const jsonBytes = new window.Blob([ stateJSON ]).size
    if (jsonBytes > MAX_JSON_BYTES) {
      this.setState({
        widgetState: 'too_large',
        jsonMB: Math.ceil(jsonBytes / (1024 * 1024)),
      })
      return
    }

    const data = new window.FormData()
    data.append(
      'script',
      new Blob(
        [ stateJSON ],
        { type: 'application/json;charset=utf-8' }
      ),
      'labjs-study.json'
    )
    data.append('name',
      state.components['root'].metadata.title || 'Unnamed study')
    data.append('description',
      state.components['root'].metadata.description)

    const RESEARCHER_URL =
      process.env.NODE_ENV === 'production'
        ? 'https://research.open-lab.online'
        : 'http://localhost:3000'

    try {
      // Send study to Open Lab
      const r = await fetch(`${RESEARCHER_URL}/api/v1/tests/labjs`, {
        method: 'POST',
        body: data,
      })

      if (r.ok) {
        const body = await r.json().catch(() => ({}))
        const uploadUrl = body.uploadUrl || r.url
        this.setState({
          widgetState: 'done',
          site_url: uploadUrl,
          statusCode: r.status,
          statusText: r.statusText,
        })
      } else {
        // Non-2xx response
        this.setState({
          widgetState: 'error',
          statusCode: r.status,
          statusText: r.statusText,
        })
      }
    } catch (error) {
      this.setState({
        widgetState: 'error_transmission',
        statusCode: undefined,
        statusText: undefined,
      })
      console.log('transmission error', error)
    }
  }

  render() {
    switch(this.state.widgetState) {
      case 'submitting':
        return <div className="text-center">
          <Icon icon="spinner-third" className="fa-spin" />
        </div>
      case 'done':
        return <>
          <p>
            <strong className="text-success">Uploaded study.</strong> Please finalize the transfer by following the link below.
          </p>
          <a
            className="btn btn-outline-primary btn-lg btn-block"
            href={ this.state.site_url }
            target="_blank"
            rel="noopener noreferrer"
          >
            Manage study on Open Lab
          </a>
        </>
      case 'too_large':
        return <p>
          <strong className="text-danger">This study is too large to upload.</strong> Its JSON is about { this.state.jsonMB } MB, but the maximum is 100 MB. Try removing large embedded files (images, audio, video) from the study and uploading them as assets instead.
        </p>
      case 'error':
        return <p>
          <strong className="text-warning">Something went wrong during transmission.</strong> Open Lab sent us an error <code>{ this.state.statusCode }</code>, which means { this.state.statusText }.
        </p>
      case 'error_transmission':
        return <p>
          <strong className="text-danger">Something went wrong.</strong> We can't tell exactly what happened, but the transfer of the study to Open Lab was cancelled. Could you check your connection?
        </p>
      default:
        return null
    }
  }
}

export default OpenLabWidget
