import fs from 'fs'

const source = './data/combined-interaction-files'
const interactionFiles = await fs.promises.readdir(source)

await Promise.all(
  interactionFiles
    .map(async file => {
      const filename = `${source}/${file}`
      if ((await fs.promises.readFile(filename)).toString().includes('anonymousId')) {
        await fs.promises.copyFile(filename, `./data/PILA-data/${file}`)
      }
    })
)
