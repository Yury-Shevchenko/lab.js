import { parents } from './index'

// The names a text reads from `parameters` inside its ${ } placeholders:
// ${ parameters.x }, ${ this.parameters.x }, ${ parameters['x'] }
export const placeholderParameters = (text) => {
  const placeholders = `${ text ?? '' }`.match(/\$\{[^}]*\}/g) || []
  const names = placeholders.flatMap(p => [
    ...p.matchAll(/\bparameters\s*(?:\.\s*([A-Za-z_$][\w$]*)|\[\s*['"]([^'"]+)['"]\s*\])/g)
  ].map(m => m[1] ?? m[2]))
  return [...new Set(names)]
}

// Names that Open Lab assigns at run time (run/lib/taskParameters.js)
const assignedAtRunTime = name => name.startsWith('openlab_')

const namedParameters = ({ parameters }={}) =>
  (Array.isArray(parameters) ? parameters : [])
    .map(p => (p.name ?? '').trim())

const loopColumns = ({ templateParameters }={}) =>
  (templateParameters?.columns ?? [])
    .map(c => (c.name ?? '').trim())

const readByScripts = ({ hooks, messageHandlers }={}) =>
  [hooks, messageHandlers]
    .flatMap(s => Array.isArray(s) ? s : [])
    .map(s => s.code ?? '')
    .join('\n')

// The names that a placeholder on a component reads and that nothing seems to
// define: neither the component, nor a component around it, nor a script
// anywhere. The study link can also provide parameters at run time, so a name
// reported here is a reason to check the spelling, not proof of an error.
export const undefinedParameters = (text, id, components) => {
  const names = placeholderParameters(text)
  if (names.length === 0) return []

  const around = [id, ...parents(id, components)].map(i => components[i])
  const defined = new Set(
    around.flatMap(c => [...namedParameters(c), ...loopColumns(c)])
  )
  const scripts = Object.values(components).map(readByScripts).join('\n')

  return names.filter(name =>
    !defined.has(name)
    && !assignedAtRunTime(name)
    && !new RegExp(`parameters\\s*(\\.\\s*|\\[\\s*['"])${ name.replace(/\$/g, '\\$') }\\b`).test(scripts)
  )
}
