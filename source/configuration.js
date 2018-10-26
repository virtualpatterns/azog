import { Process } from '@virtualpatterns/mablung'

export default {

  'cli': {

    'logLevel': 'debug',
    'logPath': `${Process.env.HOME}/Library/Logs/azog/azog.log`,
    'errorPath': `${Process.env.HOME}/Library/Logs/azog/azog.err`,
    'outputPath': `${Process.env.HOME}/Library/Logs/azog/azog.out`,

    'downloadedPath': `${Process.env.HOME}/Deluge/Downloaded`,
    'processingPath': `${Process.env.HOME}/Deluge/Processing`,
    'processedPath': `${Process.env.HOME}/Deluge/Processed`,
    'failedPath': `${Process.env.HOME}/Deluge/Failed`,

    'ffmpegPath': '/usr/local/bin/ffmpeg',
    'ffprobePath': '/usr/local/bin/ffprobe'

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
