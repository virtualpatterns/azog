import { Process } from '@virtualpatterns/mablung'

export default {

  'cli': {
    'logLevel': 'trace',
    'logPath': `${Process.env.HOME}/Library/Logs/azog/azog.log`,
    'errorPath': `${Process.env.HOME}/Library/Logs/azog/azog.err`,
    'outputPath': `${Process.env.HOME}/Library/Logs/azog/azog.out`,
    'downloadedPath': `${Process.env.HOME}/Deluge/Downloaded`,
    'processedPath': `${Process.env.HOME}/Deluge/Processed`,
    'processingPath': `${Process.env.HOME}/Deluge/Processing`,
    'failedPath': `${Process.env.HOME}/Deluge/Failed`
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
