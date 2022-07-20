import fs from 'fs'
import { analyzeInteractions } from './matts-analyzer.js'
import teacherSessions from './first-group-of-sessions-data.json' assert { type: 'json' }

const sessionInfoMap = teacherSessions.reduce((obj, { id: sessionId, user: teacherId, name: sessionName }) => {
  obj[sessionId] = { teacherId, sessionName }
  return obj
}, {})

const directoryName = './data/PILA-data/'
const dir = fs.readdirSync(directoryName)

const arrayEntryRowForEachTask = []

// do first file for example
dir.forEach(sourceFile => {
  try {
    const {
        anonymousId,
        numStarts,
        sessionTimeSecs,
        sessionType,
        taskInfo
    } = analyzeInteractions(directoryName + sourceFile)

    Object.entries(taskInfo).forEach(([nodeId, nodeInfo]) => {
        const [sessionId, userId] = sourceFile.split('.')
        arrayEntryRowForEachTask.push({
            sessionId,
            userId,
            ...sessionInfoMap[sessionId],

            anonymousId,
            numStarts,
            sessionTimeSecs,
            sessionType,

            ...nodeInfo
        })
    })
  }
  catch (e) {
      console.log(`ISSUE WITH SOURCE FILE ${sourceFile}`, e)
  }
})

fs.writeFileSync('./output.json', JSON.stringify(arrayEntryRowForEachTask))




// dir.forEach(fileName => {
//   const analyzed = analyzeInteractions(directoryName + fileName)
//   output[fileName] = analyzed
//   console.log('processed ' + fileName)
// })

// console.log(output)