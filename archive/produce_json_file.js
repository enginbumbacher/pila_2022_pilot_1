const fs = require('fs')
const { analyzeInteractions } = require('./analyze_interactions')

const directoryName = './Users/p56739/Desktop/2022_SingaporeIreland/1_raw/interaction_03_08'
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
