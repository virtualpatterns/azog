import ChildProcess from 'child_process'
import { FileSystem, Log, Path, Process } from '@virtualpatterns/mablung'
import Is from '@pwn/is'
import { quote as Quote } from 'shell-quote'
import Utilities from 'util'

import { Command } from '../../configuration'

import { DirectoryTransferError } from './error/directory-error'

const directoryPrototype = Object.create({})

directoryPrototype.transfer = async function () {

  try {

    Log.debug(`Transferring '${Path.basename(this.fromPath)}' ...`)

    Log.trace(`FileSystem.mkdir('${Path.basename(this.fromPath)}'), { 'recursive': true }`)
    await FileSystem.mkdirSync(this.fromPath, { 'recursive': true })

    let parameters = null
    parameters = this.getParameters()

    let options = null
    options = {}

    let start = Process.hrtime()
  
    try {

      Log.trace(`Directory.execFile('${Command.path.rsync}', parameters, options) ...`)
      Log.trace(Quote([
        Command.path.rsync,
        ...parameters
      ]))

      let { stdout } = await Directory.execFile(Command.path.rsync, parameters, options)

      Log.debug(`Transferred '${Path.basename(this.fromPath)}'`)
      Log.debug(`\n\n${stdout}`)

    }
    catch (error) {

      Log.trace(Is.undefined(error.stderr) ? error : `\n\n${error.stderr}`)
  
      throw new DirectoryTransferError(this.fromPath)
  
    }
    finally {
      Log.trace(`Directory.execFile('${Command.path.rsync}', parameters, options) ${Command.conversion.toDuration(Process.hrtime(start)).toFormat(Command.format.longDuration)}`)
    }
  
  }
  catch (error) {
    Log.error(error)
  }

}

directoryPrototype.getParameters = function () {
  return [
    '--exclude=.DS_Store',
    '--human-readable',
    '--itemize-changes',
    '--recursive', 
    '--remove-source-files', 
    '--verbose', 
    '--whole-file', 
    this.fromPath,
    this.toPath
  ]
}

directoryPrototype.getOptions = function () {
  return {}
}

const Directory = Object.create({})

Directory.createDirectory = function (fromPath, toPath, prototype = directoryPrototype) {

  if (Is.undefined(Directory.exec)) {
    // Directory.exec = Utilities.promisify(ChildProcess.exec)
    Directory.execFile = Utilities.promisify(ChildProcess.execFile)
  }

  let directory = Object.create(prototype)

  directory.fromPath = fromPath
  directory.toPath = toPath

  return directory

}

Directory.getDirectoryPrototype = function () {
  return directoryPrototype
}

Directory.isDirectory = function (directory) {
  return directoryPrototype.isPrototypeOf(directory)
}

export default Directory
