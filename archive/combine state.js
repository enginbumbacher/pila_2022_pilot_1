import anonIds from './anon-nickname-ids.js'
import fastJSONPatch from 'fast-json-patch'

const patchState = (startState, patch) => fastJSONPatch.applyPatch(startState || {}, patch, false, false).newDocument

let state = null

for (let i=0; i<lines.length; i++) {
  const line = lines[i]
  if (!line) return
  const sep = line.indexOf(' ')
  const patchJSON = line.slice(sep + 1)
  try {
    state = patchState(state, JSON.parse(patchJSON))
  }
  catch (error) {
    console.log(error)
    break
  }
  finally {
    if (state && state.anonymousId && anonIds.includes(state.anonymousId)) {
      console.log(state)
      await fs.promises.copyFile(filename, `./data/PILA-data/${file}.${state.anonymousId}`)
      break
    }
  }