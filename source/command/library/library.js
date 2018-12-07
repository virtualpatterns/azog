import ChildProcess from 'child_process'
import { FileSystem, Log, Path, Process } from '@virtualpatterns/mablung'
import Is from '@pwn/is'
import { quote as Quote } from 'shell-quote'

import { Command } from '../../configuration'

import { LibraryTransferError } from './error/library-error'

const libraryPrototype = Object.create({})

libraryPrototype.transfer = function () {

  return new Promise(async (resolve, reject) => {

    try {

      Log.debug(`Transferring '${Path.basename(this.fromPath)}' ...`)

      Log.trace(`FileSystem.mkdir('${Path.basename(this.fromPath)}'), { 'recursive': true }`)
      await FileSystem.mkdir(this.fromPath, { 'recursive': true })
  
      let parameters = [
        '--exclude=.DS_Store',
        '--human-readable',
        '--itemize-changes',
        '--progress',
        '--recursive', 
        '--remove-source-files', 
        '--rsh=ssh',
        '--verbose', 
        '--whole-file', 
        this.fromPath,
        this.toPath
      ]
      
      let options = {}
  
      Log.trace(`ChildProcess.spawn(command, parameters, options) this.fromPath = '${Path.basename(this.fromPath)}' ...`)
      Log.trace(Quote([
        Command.path.rsync,
        ...parameters
      ]))

      let stdout = ''
      let stderr = ''
  
      let start = Process.hrtime()
      let progress = Process.hrtime()

      let process = null
      process = ChildProcess.spawn(Command.path.rsync, parameters, options)

      process.stdout.on('data', (data) => {

        let dataAsString = null
        dataAsString = data.toString()

        let pattern = /\d+\.?\d*%/
        let match = null
      
        if (Is.not.null(match = pattern.exec(dataAsString))) {
      
          let [ percentAsString ] = match
          let percentAsNumber = parseFloat(percentAsString)

          let progressInSeconds = Command.conversion.toSeconds(Process.hrtime(progress))
          let [ minimumProgressInSeconds ] = Command.range.progressInSeconds

          if (progressInSeconds >= minimumProgressInSeconds) {
            Log.trace(`ChildProcess.spawn(command, parameters, options) this.fromPath = '${Path.basename(this.fromPath)}' ${Command.conversion.toPercent({ 'percent': percentAsNumber })}%`)
            progress = Process.hrtime()
          }

        }
        else {
          stdout += dataAsString
        }

      })
      
      process.stderr.on('data', (data) => {
 
        let dataAsString = null
        dataAsString = data.toString()

        stderr += dataAsString

      })

      process.on('error', (error) => {

        Log.trace(error, `ChildProcess.on('error'), (error) => { ... }) this.fromPath = '${Path.basename(this.fromPath)}'`)

        reject(new LibraryTransferError(this.fromPath))

      })
      
      process.on('exit', (code, signal) => {

        Log.trace(`ChildProcess.on('exit'), (${code}, ${Is.not.null(signal) ? `'${signal}'` : signal}) => { ... }) this.fromPath = '${Path.basename(this.fromPath)}' ${Command.conversion.toDuration(Process.hrtime(start)).toFormat(Command.format.longDuration)}`)

        if (Is.not.emptyString(stderr)) {

          Log.trace(`\n\n${stderr}`)

          reject(new LibraryTransferError(this.fromPath))

        }
        else {

          if (Is.not.emptyString(stdout)) {
            Log.trace(`\n\n${stdout}`)
          }

          resolve()

        }

      })

    }
    catch (error) {
      reject(error)
    }

  })

}

libraryPrototype.getParameters = function () {
}

libraryPrototype.getOptions = function () {
  return {}
}

const Library = Object.create({})

Library.createLibrary = function (fromPath, toPath, prototype = libraryPrototype) {

  let library = Object.create(prototype)

  library.fromPath = fromPath
  library.toPath = toPath

  return library

}

Library.getLibraryPrototype = function () {
  return libraryPrototype
}

Library.isLibrary = function (library) {
  return libraryPrototype.isPrototypeOf(library)
}

export default Library
