import fs from 'fs'
import jsonpatch from 'fast-json-patch'

function analyzeInteractions(fileName) {

    const data = fs.readFileSync(fileName, 'utf8')
    const patches = getPatches(data)

    const firstState = getStateAfterFirstPatch(patches)
    const tasks = firstState.graph.nodes
    const allUsedExamples = getAllUsedExamples()
    const allUsedHints = getAllUsedHints()
    const timeBreakdown = getTimeBreakdown()
    const taskInfo = getTaskInfo()

    return {
        anonymousId: getAnonymousId(),
        numStarts: numberOfStarts(),
        sessionTimeSecs: totalSessionTime(timeBreakdown),
        sessionType: getSessionType(),
        taskInfo: taskInfo
    }

    function getTaskInfo() {
        let output = {}
        Object.keys(tasks).forEach(task => {
            output[task] = {
                taskName: nodeName(task),
                taskId: tasks[task].content,
                order: tasks[task].y,
                nodeId: task,
                visitedAndLoaded: isVisitedAndLoaded(task),
                correct: isCorrect(task),
                timeOnTask: timeBreakdown[task],
                hasExamples: hasExamples(task),
                goodExampleUsed: goodExampleUsed(task),
                badExampleUsed: badExampleUsed(task),
                hasHint: hasHint(task),
                hintUsed: usedHint(task)
            }
        })  
        return output
    }

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

        // two ways good example is set to not exist
        const searchStrings1 = [ `${task}/state","value":`, `goodExample":""` ]
        const foundIndices1 = findMultipleInArrayOfStrings(searchStrings1, patches)
        const searchStrings2 = [ `${task}/state","value":`, `goodExample":null` ]
        const foundIndices2 = findMultipleInArrayOfStrings(searchStrings2, patches)

        const noExample = foundIndices1.length > 0 || foundIndices2.length > 0
        if (noExample) return false

        const searchStrings3 = [ `${task}/state","value":`, `goodExample":"`]
        const foundIndices3 = findMultipleInArrayOfStrings(searchStrings3, patches)
        return foundIndices3.length > 0
        
    }
    function goodExampleUsed(task) {
        if (!hasExamples(task)) return null
        return allUsedExamples.some(ex => ex.path.includes(task) && ex.value.includes('good'))
    }
    function badExampleUsed(task) {
        if (!hasExamples(task)) return null
        return allUsedExamples.some(ex => ex.path.includes(task) && ex.value.includes('bad'))
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

        return allUsedHints.some(hint => hint.path.includes(task))
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

    function numberOfStarts() {
        const searchString = `taskMotionLog/1"`
        return findInArrayOfStrings(searchString, patches).length

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
            } else {
                output[task] = output[task] + 1
            }
        })
        return output
    }

    function totalSessionTime(timeBreakdown) {
        let total = 0
        Object.values(timeBreakdown).forEach(t => total += t)
        return total
    }

    function getSessionType() {
        const numTasks = Object.keys(tasks).length
        const taskOneToSession = {
            'd64e5ac0-9d70-11ec-8f4f-ed2125c96d90' : '2A',
            'ce822230-a4ba-11ec-8a54-7d9150161085' : '2A',
            'a9e99130-9d6f-11ec-b7a7-4b50165ce4f7' : '2B',
            'fdeedcb0-9df9-11ec-acca-f57f7eb70225' : '3A',
            '9e1ba740-9dfa-11ec-b504-9d89d528a2bc' : '3B',
        }
        if (numTasks === 1) {
            return 'Survey'
        } else {
            const taskOne = Object.values(taskInfo).filter(task => task.taskName.includes('Task 1'))[0].nodeId
            return taskOneToSession[taskOne]
        }
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
}

export { analyzeInteractions }