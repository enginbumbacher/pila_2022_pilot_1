import fs from "fs"
import anonIds from './anon-nickname-ids.js'

const isUUID = x => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(x)

const foundIds = {}

const getDirectories = async source =>
  (await fs.promises.readdir(source, { withFileTypes: true }))
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name)
const bucket = './opensourcelearningplatform.appspot.com'
const userDirs = await getDirectories(bucket)

userDirs
  .filter(name => !isUUID(name))
  .forEach(async user => {
    const targetDirs = await getDirectories(`./${bucket}/${user}`)
    targetDirs
      .filter(name => isUUID(name))
      .forEach(async (target, index) => {
        const combinedInteractionFile = `./combined-interaction-files/${target}.${user}`
        const timestamps = (await fs.promises.readdir(`./${bucket}/${user}/${target}`)).sort()
        if (fs.existsSync(combinedInteractionFile)) await fs.promises.unlink(combinedInteractionFile)
        console.log('START Writing File', index)
        while (timestamps.length) {
          const ts = timestamps.shift()
          const filename = `${bucket}/${user}/${target}/${ts}`
          const data = await fs.promises.readFile(filename)
          await fs.promises.appendFile(combinedInteractionFile, data)
        }
        console.log('DONE Writing File', index)
      })
  })
