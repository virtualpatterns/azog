import { Process } from '@virtualpatterns/mablung'

export default {

  'cli': {
    'logLevel': 'trace',
    'logPath': `${Process.env.HOME}/Library/Logs/azog/azog.log`,
    'downloadedPath': `${Process.env.HOME}/Deluge/Downloaded`,
    'processingPath': `${Process.env.HOME}/Deluge/Processing`
  },

  'tasks': {
    'logLevel': 'trace',
    'logPath': `${Process.env.HOME}/Library/Logs/azog/azog-tasks.log`
  },

  'tests': {
    'logLevel': 'trace',
    'logPath': `${Process.env.HOME}/Library/Logs/azog/azog-tests.log`
  }

}
