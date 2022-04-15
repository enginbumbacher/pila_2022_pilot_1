import os
import re
import shutil

nicknames = open('nicknames.txt').read().split('\n')

sourceDirectory = "data/PILA-data"
targetDirectory = "data/removed-during-processing/unsorted-3ab-no-second-task"
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

def getSession(text, filename):
    if "Pilot Session 1" in text:
        return "Session 1"
    elif '"Task 1: Intro Function"' in text:
        # this id is for a slide in the tutorial only found in session 2A
        if '199fe970-9d8e-11ec-82cb-6dbe8ad30586' in text:
            return "Session 2A"
        else:
            return "Session 2B"
    elif '"label":"Task 1: Intro Conditionals"' in text:
        # from session 3A, task 2
        if '"hint":"You can change the condition to test in the \'if\' bloc' in text:
            return "Session 3A"
        else:
            if '"hint":"' not in text:
                print("NEVER MADE IT TO SECOND TASK!!!!!!!!!!!", filename)
                shutil.move(
                    sourceDirectory + '/' + filename,
                    targetDirectory + '/' + filename
                )
            return "Session 3B"

for filename in os.listdir(sourceDirectory):
    with open(os.path.join(sourceDirectory, filename), 'r') as f:
        text = f.read()
        entry = {
            "filename": filename,
            "nickname": getNickname(text, filename),
            "session": getSession(text, filename)
        }
        # if getNickname(text, filename) == None:
        #     withoutNicknames.append(filename)
        #     if '"op":"replace","path":"/anonymousId"' in text:
        #         index = text.index('"op":"replace","path":"/anonymousId"')
        #         print('Moving', filename)
        #         shutil.move(
        #             sourceDirectory + '/' + filename,
        #             targetDirectory + '/' + filename
        #         )
        #     else:
        #         print('ILLEGAL MOVE!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!', filename)
        # else:
        #     withNicknames.append(filename)
