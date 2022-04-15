import os
import json
import jsonpatch

sourceDirectory = 'data/PILA-data'
targetDirectory = 'data/PILA-data-end-states'
numErrors = 0

def processEndState(filename):
    global numErrors
    with open(sourceDirectory + '/' + filename) as f:
        state = {}
        errored = False
        lines = f.read().split('\n')[:-1]
        for idx, line in enumerate(lines):
          try:
            ts_patch = line.split(" ", 1)
            ts = ts_patch[0]
            x = json.loads(ts_patch[1])
            patch = jsonpatch.JsonPatch(x)
            patch.apply(state, True)
          except:
            numErrors += 1
            errored = True
            print('ERROR!!!!!!!!!!!!!!!! in line', idx, filename)
            print('ABOVE:', lines[idx - 5][:90])
            print('ABOVE:', lines[idx - 4][:90])
            print('ABOVE:', lines[idx - 3][:90])
            print('ABOVE:', lines[idx - 2][:90])
            print('ABOVE:', lines[idx - 1][:90])
            print('::::::', lines[idx][:90])
            print('BELOW:', lines[idx + 1][:90])
            print('')
            print('')
            # with open(targetDirectory + '/ERROR.' + str(idx) + '.' + filename + '.end-state.json', 'w') as outfile:
            #     json.dump(state, outfile)
            break
        if not errored:
            print('COMPLETED ' + filename)
            # with open(targetDirectory + '/' + filename + '.end-state.json', 'w') as outfile:
            #     json.dump(state, outfile)
        print('NUM ERRORED', numErrors)

for filename in os.listdir(sourceDirectory):
    processEndState(filename)
