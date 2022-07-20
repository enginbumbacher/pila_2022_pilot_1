import fastJSONPatch from 'fast-json-patch'

const patchState = (startState, patch) => fastJSONPatch.applyPatch(startState || {}, patch, false, false).newDocument


lines.forEach( line => {
    if (!line) return
    if (errored) return
    const sep = line.indexOf(' ')
    const patchJSON = line.slice(sep + 1)
    try { state = patchState(state, JSON.parse(patchJSON)) }
    catch (error) {
      if (state && state.anonymousId) {
        console.log(patchJSON)
        console.log(
          'ERROR PATCH',
          JSON.stringify(state, null, 4),
          patchJSON
        )
        fs.promises.writeFile(`./end-states/ERRORED.${user}.${target}.json`, JSON.stringify(state, null, 4))
        }
      errored = true
    }
  })