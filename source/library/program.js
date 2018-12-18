import { FileSystem, Log, Path, Process } from '@virtualpatterns/mablung'
import _Program from 'commander'

import Configuration from '../configuration'

const Program = Object.create(_Program)

// .command()
// .description()
// .option()
// .option()
// .option()
// .action()

// Object.setPrototypeOf(Configuration, Merge(Object.getPrototypeOf(Configuration), configuration))

// Program.command = function (...parameters) {
//   Object.setPrototypeOf(Program, _Program.command.apply(Program, parameters))
//   return Program
// }

// Program.description = function (...parameters) {
//   Object.setPrototypeOf(Program, _Program.description.apply(Program, parameters))
//   return Program
// }

// Program.option = function (...parameters) {
//   Object.setPrototypeOf(Program, _Program.option.apply(Program, parameters))
//   return Program
// }

// Program.action = function (...parameters) {
//   Object.setPrototypeOf(Program, _Program.action.apply(Program, parameters))
//   return Program
// }

Program.onAction = async function (options, fn) {

  try {

    if (options.configurationPath) {
      Configuration.merge(options.configurationPath.split(','))
    }

    Configuration.logLevel = options.logLevel || Configuration.logLevel
    Configuration.logPath = options.logPath || Configuration.logPath

    if (Configuration.logPath == 'console') {
      Log.createFormattedLog({ 'level': Configuration.logLevel })
    }
    else {
      await FileSystem.mkdir(Path.dirname(Configuration.logPath), { 'recursive': true })
      Log.createFormattedLog({ 'level': Configuration.logLevel }, Configuration.logPath)
    }

    try {
  
      Process.once('SIGINT', () => {
        Log.debug('Process.once(\'SIGINT\', () => { ... })')
  
        Process.exit(2)
  
      })
  
      Process.once('SIGTERM', () => {
        Log.debug('Process.once(\'SIGTERM\', () => { ... })')
  
        Process.exit(2)
  
      })
  
      Process.once('uncaughtException', (error) => {
        Log.error('Process.once(\'uncaughtException\', (error) => { ... })')
        Log.error(error)
  
        Process.exit(2)
  
      })
  
      Process.on('warning', (error) => {
        Log.error('Process.on(\'warning\', (error) => { ... })')
        Log.error(error)
      })
  
      await fn()
  
    }
    catch (error) {

      delete error.name

      Log.error('catch (error) { ... }')
      Log.error(error)
  
      Process.exit(2)
  
    }

  } 
  catch (error) {

    console.log(error)

    Process.exit(2)

  }
  
  Process.exit(0)
  
}

export default Program
