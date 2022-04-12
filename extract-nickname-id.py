import os
import re
import shutil

nicknames = open('nicknames.txt').read().split('\n')

sourceDirectory = "data/PILA-data"
targetDirectory = "data/removed-during-processing/removed-for-no-nickname"
entries = []

def getNickname(text, filename):
    for nickname in nicknames:
        #print(nickname, text)
        # #
        # if numMatches > 1:
        #     print('POSSIBLE RESET ' + numMatches, filename)
        # if numMatches > 0:
        #     return nickname
        if nickname in text:
            # numMatches = len([*re.finditer(nickname, text)])
            # print(numMatches)
            # if numMatches > 1:
            #     print('GOOOOOOOOOOT MORE THAN ONE MATCH')
            #     print(numMatches)
            #     print(filename)
            return nickname

def getSession(text):
    if "Pilot Session 1" in text:
        return "Session 1"
    # following conditions are unique task ids in each session
    elif "0573da80-6c68-11ec-98c7-81323c687b0f" in text:
        if "98cad5b0-9e43-11ec-aa7c-c767d0cff0d2" in text:
            print('IIIIIIIISUE!!!!!!!!!!!!!!!!!!!!!!!')
        return "Session 2A/B"
    elif "98cad5b0-9e43-11ec-aa7c-c767d0cff0d2" in text:
        return "Session 3A/B"

withNicknames = []
withoutNicknames = []
for filename in os.listdir(sourceDirectory):
    with open(os.path.join(sourceDirectory, filename), 'r') as f:
        text = f.read()
        # entry = {
        #     "filename": filename,
        #     "nickname": getNickname(text, filename),
        #     "session": getSession(text)
        # }
        # print(entry)
        if getNickname(text, filename) == None:
            withoutNicknames.append(filename)
            if '"op":"replace","path":"/anonymousId"' in text:
                index = text.index('"op":"replace","path":"/anonymousId"')
                print(text[index:index + 50])
            else:
                shutil.move(
                    sourceDirectory + '/' + filename,
                    targetDirectory + '/' + filename
                )
        else:
            withNicknames.append(filename)