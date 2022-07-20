const fs = require('fs')
const jsonpatch = require('fast-json-patch');

const data = fs.readFileSync('0c698380-a377-11ec-9282-3b30ef53f779.s7gYl57pGhVNcbAVkC0vTnA0vRp2', 'utf8')
const patches = getPatches(data)

const firstState = getStateAfterFirstPatch(patches)
const tasks = firstState.graph.nodes
const timeBreakdown = getTimeBreakdown()

// LOG ALL SESSION RESULTS
console.log('Learner Anon Id: ', getAnonymousId())
console.log('Number of Starts: ', numberOfStarts())
console.log('session time: ', (totalSessionTime(timeBreakdown)/60).toFixed(2) + ' minutes')
console.log('NEEEDED... WHICH SESSION WE ARE IN, 2a/b, 3a/b')

// LOG ALL CALCULATED TASK RESULTS
Object.keys(tasks).forEach(task => {
    console.log('------------------------')
    console.log('task name: ', nodeName(task))
    console.log('task node id: ', task)
    console.log('visited and loaded: ', isVisitedAndLoaded(task))
    console.log('correct: ', isCorrect(task))
    console.log('time on task', timeBreakdown[task] + ' seconds' )
    console.log('hasExamples: ', hasExamples(task))
    console.log('good example used: ', goodExampleUsed(task))
    console.log('bad example used: ', badExampleUsed(task))
    console.log('hasHint ', hasHint(task))
    console.log('usedHint ', usedHint(task))
})

function getPatches(data) {
    const lines = data.split(/\r?\n/)
    return lines.map(line => {
        const i = line.indexOf(' ')
        const ts = line.substring(0, i)
        const patch = line.substring(i)
        // return { ts, patch}
        return patch
    })
}

function getStateAfterFirstPatch(patches) {
    const parsedFirstPatch = JSON.parse(patches[0])
    return jsonpatch.applyPatch({}, parsedFirstPatch).newDocument
}

function nodeName(task) {
    return tasks[task].label
}

function isVisitedAndLoaded(task) {
    // const searchString = `${task}/visited","value":true`

     // more reliable in case 'visited' attempted, true, but task not loaded successfully
    const searchString = `${task}/state"`
    return data.includes(searchString)
}

function isCorrect(task) {
    const searchString = `${task}/correct","value":true`
    return data.includes(searchString)
}

function hasExamples(task) {
    if (!isVisitedAndLoaded(task)) return null // can't determine hasExamples if not loaded

    const searchStrings = [
        `${task}/state","value":`,
        `goodExample":"`
    ]
    const foundIndices = findMultipleInArrayOfStrings(searchStrings, patches)
    return foundIndices.length > 0
}
function goodExampleUsed(task) {
    if (!hasExamples(task)) return null
    return getAllUsedExamples().some(ex => ex.path.includes(task) && ex.value.includes('good'))
}
function badExampleUsed(task) {
    if (!hasExamples(task)) return null
    return getAllUsedExamples().some(ex => ex.path.includes(task) && ex.value.includes('bad'))
}

function hasHint(task) {
    if (!isVisitedAndLoaded(task)) return null // can't determine hasHint if not loaded

    const searchOne = [ `${task}/state"`, `hint":""` ]
    if (findMultipleInArrayOfStrings(searchOne, patches).length > 0) return false

    const searchTwo = [`${task}/state"`, `hint":"`]
    if (findMultipleInArrayOfStrings(searchTwo, patches).length > 0) return true

    return false
}

function usedHint(task) {
    if (!hasHint(task)) return null

    return getAllUsedHints().some(hint => hint.path.includes(task))
}


function getAnonymousId() {
    // will not find when set to null, because of the final " after value opening the id string
    const searchString = `anonymousId","value":"`
    const foundIndices = findInArrayOfStrings(searchString, patches)
    if (foundIndices.length === 0) return null
    else {
        const i = foundIndices[0]
        const patch = JSON.parse(patches[i])[0]
        return patch.value
    }
}

function getAllUsedHints() {
    const searchString = `"value":{"type":"hint"`
    const foundIndices = findInArrayOfStrings(searchString, patches)
    return foundIndices.map(i => JSON.parse(patches[i]) ).map(el => el[0] )
}

function getAllUsedExamples() {
    const goodString = `mode","value":"good-example"`
    const goodIndices = findInArrayOfStrings(goodString, patches)
    const badString = `mode","value":"bad-example"`
    const badIndices = findInArrayOfStrings(badString, patches)
    const usedExampleIndices = [ ...goodIndices, ...badIndices ]
    return usedExampleIndices.map(i => JSON.parse(patches[i])).map(el => el[0])
}

function numberOfStarts() {
    const searchString = `taskMotionLog/1"`
    return findInArrayOfStrings(searchString, patches).length

}

function getTimeBreakdown() {
    let output = { map: 0 }
    // the slash at the end of taskMotionLog ignores its init, only when pushes made
    const foundIndices = findInArrayOfStrings("/taskMotionLog/",patches)
    foundIndices.forEach(i => {
        // null means on map
        const task = JSON.parse(patches[i])[0].value.task
        if (task === null) {
            output.map = output.map + 1
        } else if (!output[task]) {
            output[task] = 1
        } else [
            output[task] = output[task] + 1
        ]
    })
    return output
}

function totalSessionTime(timeBreakdown) {
    let total = 0
    Object.values(timeBreakdown).forEach(t => total += t)
    return total
}

function findInArrayOfStrings(string, array) {
    let foundIndices = []
    for (let i=0; i<array.length; i++) {
        if (array[i].includes(string)) foundIndices.push(i)
    }
    return foundIndices
}

function findMultipleInArrayOfStrings(testStrings, array) {
    let foundIndices = []
    for (let i = 0; i < array.length; i++) {
        if (testStrings.every( str => array[i].includes(str)) ) foundIndices.push(i)
    }
    return foundIndices
}