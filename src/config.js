import { FileSystem, Process } from '@virtualpatterns/mablung'
import OS from 'os'

let userExtensionsPath = `${Process.env.HOME}/Deluge/extensions.json`
let userExtensions = {}

try {
  FileSystem.accessSync(userExtensionsPath, FileSystem.F_OK)
  userExtensions = require(userExtensionsPath)
}
catch (error) {
  // Do nothing
}

export default {

  'cli': {

    'logLevel': 'debug',
    'logPath': `${Process.env.HOME}/Deluge/Logs/azog.log`,

    'maximumConcurrentFiles': OS.cpus().length - 1,
    'maximumQueuedFiles': Infinity,

    'extensions': {

      'book': [ '.epub', '.mobi', '.pdf', ...(userExtensions.book || [])],
      'music': [ '.flac', '.m4a', '.mp3', ...(userExtensions.music || [])],
      'video': [ '.avi', '.m4v', '.mkv', '.mov', '.mp4', ...(userExtensions.video || [])],
      'other': [ '.rar', '.zip', ...(userExtensions.other || [])]

    },

    'paths': {

      'downloaded': `${Process.env.HOME}/Deluge/Downloaded`,
      'processing': `${Process.env.HOME}/Deluge/Processing`,
      'processed': `${Process.env.HOME}/Deluge/Processed`,
      'failed': `${Process.env.HOME}/Deluge/Failed`,

      'ffmpeg': '/usr/local/bin/ffmpeg',
      'ffprobe': '/usr/local/bin/ffprobe'

    }
        
  },

  'tasks': {
    'logLevel': 'debug',
    'logPath': `${Process.env.HOME}/Deluge/Logs/azog-tasks.log`
  },

  'tests': {
    'logLevel': 'debug',
    'logPath': `${Process.env.HOME}/Deluge/Logs/azog-tests.log`
  }

}
