import { Process } from '@virtualpatterns/mablung'

export default {

  'cli': {
    'logLevel': 'trace',
    'logPath': `${Process.env.HOME}/Library/Logs/azog/azog.log`
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
