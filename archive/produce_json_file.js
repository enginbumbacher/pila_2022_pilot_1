const fs = require('fs')
const { analyzeInteractions } = require('./analyze_interactions')

const directoryName = './process-pila-data/data/PILA-data/'
const dir = fs.readdirSync(directoryName)

const arrayEntryRowForEachTask = []

dir.forEach(sourceFile => {
  const {
    anonymousId,
    numStarts,
    sessionTimeSecs,
    sessionType,
    taskInfo
  } = analyzeInteractions(directoryName + sourceFile)

  Object.entries(taskInfo).forEach(([nodeId, nodeInfo]) => {
    arrayEntryRowForEachTask.push({
      sourceFile,

      anonymousId,
      numStarts,
      sessionTimeSecs,
      sessionType,

      ...nodeInfo

    })
  })

})