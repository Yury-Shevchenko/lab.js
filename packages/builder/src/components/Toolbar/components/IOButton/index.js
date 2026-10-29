import React, { useState, useCallback } from 'react'
import { useStore } from 'react-redux'

import {
  ButtonDropdown,
  Button,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from 'reactstrap'

import Uploader from '../../../Uploader'
import Icon from '../../../Icon'

import { fromJSON } from '../../../../logic/io/load'
import { stateToDownload, stateToJSON } from '../../../../logic/io/save'
import downloadStaticLocal from '../../../../logic/io/export/modifiers/local'

import { downloadSidecar as downloadPsychDS } from '../../../../logic/metadata/psych-ds'

const RESEARCHER_URL =
  process.env.NODE_ENV === 'production'
    ? 'https://research.open-lab.online'
    : 'http://localhost:3000'

export const useSaveToOpenLab = () => {
  const store = useStore()
  const [saveState, setSaveState] = useState('idle') // idle | saving | saved | error

  const taskId = new URL(window.location.href).searchParams.get('t')

  const saveToOpenLab = useCallback(async () => {
    setSaveState('saving')

    const state = store.getState()
    const stateJSON = stateToJSON(state)
    const title = state.components?.root?.metadata?.title || 'Unnamed study'
    const description = state.components?.root?.metadata?.description || ''

    const formData = new window.FormData()
    formData.append(
      'script',
      new Blob([stateJSON], { type: 'application/json;charset=utf-8' }),
      'labjs-study.json',
    )

    formData.append('name', title)
    formData.append('description', description)
    if (taskId) {
      formData.append('taskId', taskId)
    }

    try {
      const res = await fetch(`${RESEARCHER_URL}/api/v1/tests/labjs`, {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        const { error } = await res.json().catch(() => ({}))
        alert(`Save failed: ${error || res.statusText}`)
        setSaveState('error')
        return
      }

      const body = await res.json()

      setSaveState('saved')
      setTimeout(() => setSaveState('idle'), 3000)

      // Open the uploaded task in Open Lab
      if (body.uploadUrl) {
        window.open(body.uploadUrl, '_blank', 'noopener,noreferrer')
      }
    } catch (e) {
      alert(`Save failed: ${e}`)
      setSaveState('error')
    }
  }, [store, taskId])

  const saveButtonLabel = () => {
    switch (saveState) {
      case 'saving':
        return 'Saving…'
      case 'saved':
        return 'Saved ✓'
      case 'error':
        return 'Save to Open Lab'
      default:
        return 'Save to Open Lab'
    }
  }

  return { saveToOpenLab, saveState, saveButtonLabel }
}

// TODO: Refactor dispatch calls to action creators
const IOButton = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const store = useStore()
  const taskId = new URL(window.location.href).searchParams.get('t')

  const { saveToOpenLab, saveState, saveButtonLabel } = useSaveToOpenLab()

  return (
    <ButtonDropdown
      isOpen={dropdownOpen}
      toggle={() => setDropdownOpen(!dropdownOpen)}
    >
      <Button
        id="caret"
        outline
        color="secondary"
        onClick={e =>
          stateToDownload(store.getState(), { removeInternals: e.shiftKey })
        }
      >
        <Icon icon="save" weight="l" fallbackWeight="r" />
      </Button>
      <DropdownToggle caret split outline color="secondary" />
      <DropdownMenu>
        <DropdownItem header>Study</DropdownItem>
        <DropdownItem
          onClick={() => {
            if (window.confirm('Are you sure you want to reset the study?')) {
              store.dispatch({ type: 'RESET_STATE' })
            }
          }}
        >
          New
        </DropdownItem>
        <Uploader
          accept="application/json"
          multiple={false}
          maxSize={255 * 1024 ** 2} // 250MB + some headroom
          onUpload={([[content]]) => {
            try {
              // Parse file from JSON
              const state = fromJSON(content)
              // Hydrate store from resulting object
              store.dispatch({
                type: 'HYDRATE',
                state,
              })
            } catch (e) {
              // If things don't work out, let the user know
              alert("Couldn't load file, found error", e)
            } finally {
              // TODO: Close this earlier if possible
              setDropdownOpen(false)
            }
          }}
          className="dropdown-item"
        >
          Open
        </Uploader>
        <DropdownItem
          onClick={e =>
            stateToDownload(store.getState(), { removeInternals: e.shiftKey })
          }
        >
          Save
        </DropdownItem>
        <DropdownItem divider />
        <DropdownItem header>Export for local use</DropdownItem>
        <DropdownItem onClick={() => downloadStaticLocal(store.getState())}>
          Offline data collection
        </DropdownItem>
        <DropdownItem divider />
        <DropdownItem header>Deploy study online</DropdownItem>
        {taskId ? (
          <>
            <DropdownItem
              disabled={saveState === 'saving'}
              onClick={saveToOpenLab}
            >
              {saveButtonLabel()}
            </DropdownItem>
            <DropdownItem
              onClick={() =>
                window.open(
                  `${RESEARCHER_URL}/dashboard/tasks/${taskId}`,
                  '_blank',
                  'noopener,noreferrer',
                )
              }
            >
              View task on Open Lab
            </DropdownItem>
          </>
        ) : (
          <DropdownItem
            onClick={() =>
              store.dispatch({
                type: 'SHOW_MODAL',
                modalType: 'EXPORT_OPENLAB',
                modalProps: {},
              })
            }
          >
            Upload to Open Lab…
          </DropdownItem>
        )}
      </DropdownMenu>
    </ButtonDropdown>
  )
}

export default IOButton
