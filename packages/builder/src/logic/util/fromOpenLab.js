import { fromObject } from '../io/load'

const BACKEND_URL =
  process.env.NODE_ENV === 'production'
    ? 'https://backend.open-lab.online'
    : 'http://localhost:4000'

// Load a study from Open Lab by task id.
// Fetches via the Keystone proxy so the browser never touches DO Spaces directly.
export const fromOpenLab = async taskId => {
  try {
    const res = await fetch(`${BACKEND_URL}/api/task-json/${taskId}`, {
      credentials: 'include',
    })

    if (!res.ok) {
      alert(`Error loading task ${taskId}: ${res.status} ${res.statusText}`)
      return
    }

    const data = await res.json()
    const state = fromObject(data)

    return state
  } catch (e) {
    console.error('Failed to load Open Lab task', e)
    alert(`Error loading task: ${e}`)
  }
}
