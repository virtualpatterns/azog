import { DateTime, Duration } from 'luxon'
import Is from '@pwn/is'
import Merge from 'deepmerge'
import OS from 'os'
import { Path, Process } from '@virtualpatterns/mablung'
import Property from 'object-path'

// const MILLISECONDS_PER_MINUTE = 1000 * 60
const MILLISECONDS_PER_SECOND = 1000
const NANOSECONDS_PER_SECOND = 1000000000
// const SECONDS_PER_MINUTE = 60

const KILO_PER_UNIT = 1000

const Configuration = Object.create({
  'connection': {
    'administrator': {
      'database': 'postgres'
    },
    'user': {
      'database': 'azog'
    }
  },
  'conversion': {
    // 'minutesToMilliseconds': (minutes) => minutes * MILLISECONDS_PER_MINUTE,
    'secondsToMilliseconds': (seconds) => seconds * MILLISECONDS_PER_SECOND,
    // 'secondsToMinutes': (seconds) => seconds / SECONDS_PER_MINUTE,
    'toDuration': ([ seconds, nanoseconds ]) => Duration.fromMillis((seconds + nanoseconds / NANOSECONDS_PER_SECOND) * MILLISECONDS_PER_SECOND), 
    'toKilo': (unit) => (unit / KILO_PER_UNIT).toFixed(2),
    'toPercent': (progress) => progress.percent.toFixed(2),
    'toMinutes': (minutes) => minutes.toFixed(2),
    'toSeconds': ([ seconds, nanoseconds ]) => (seconds + nanoseconds / NANOSECONDS_PER_SECOND).toFixed(2)
  },
  'extension': {
    'ignore': [ '.map', '.txt' ],
    'book': [ '.epub', '.mobi', '.pdf' ],
    'music': [ '.flac', '.m4a', '.mp3' ],
    'video': [ '.avi', '.m4v', '.mkv', '.mov', '.mp4' ],
    'other': [ '.rar', '.zip' ]      
  },
  'format': {
    'date': 'yyyy-LL-dd',
    'longDuration': 'hh\'h\' mm\'m\' ss.SSSS\'s\'',
    'shortDuration': 'ss.SSSS\'s\'',
    'rate': 'kHz'
  },
  'key': {
    'movieDB': '',
    'tvDB': ''
  },
  'line': '-'.repeat(80),
  'logLevel': 'debug',
  'logPath': `${Process.env.HOME}/Deluge/Log/azog.log`,
  'path': {
    'migration': {
      'template': `${__dirname}/../source/migration/template.js`,
      'source': `${__dirname}/../source/migration`,
      'distributable': `${__dirname}/../distributable/migration`
    },
    'processing': `${Process.env.HOME}/Deluge/Processing`,
    'processed': {
      'episode': `${Process.env.HOME}/Deluge/Processed/TV Shows`,
      'movie': `${Process.env.HOME}/Deluge/Processed/Movies`,
      'music': `${Process.env.HOME}/Deluge/Processed/Music`,
      'other': `${Process.env.HOME}/Deluge/Processed/Other`
    },
    'failed': `${Process.env.HOME}/Deluge/Failed`,
    'ffmpeg': '/usr/local/bin/ffmpeg',
    'ffprobe': '/usr/local/bin/ffprobe' //,
    // 'rsync': '/usr/local/bin/rsync',
    // 'library': {
    //   'from': {
    //     'movies': `${Process.env.HOME}/Deluge/Processed/Movies`,
    //     'moviesDocumentaries': `${Process.env.HOME}/Deluge/Processed/Movies (Documentaries)`,
    //     'moviesMiscellaneous': `${Process.env.HOME}/Deluge/Processed/Movies (Miscellaneous)`,
    //     'music': `${Process.env.HOME}/Deluge/Processed/Music`,
    //     'series': `${Process.env.HOME}/Deluge/Processed/TV Shows`,
    //     'seriesDocumentaries': `${Process.env.HOME}/Deluge/Processed/TV Shows (Documentaries)`
    //   },
    //   'to': 'BUCKBEAK.local:/Volumes/BUCKBEAK2/Media'
    // }
  },
  'queue': {
    'autoStart': false,
    'concurrency': OS.cpus().length
  },
  'range': {
    'progressInSeconds':  {
      'minimum': 15.0,
      'maximum': Infinity
    },
    'videoDurationInMinutes':  {
      'minimum': 15.0,
      'maximum': Infinity
    },
    'yearReleased': {
      'minimum': 1888,
      'maximum': DateTime.local().year + 1
    }
  },
  'transform': {
    'remove': [ 
      /[()]/g,
      /\s{2,}/g,
      /^[\s-]/,
      /[-\s]$/,
      /\[.+]$/
    ],
    'replace': [
      { 
        'pattern': /\.+/g, 
        'with': ' ' 
      },
      { 
        'pattern': /(\S)-(\S)/g, 
        'with': '$1 $2' 
      } 
    ]
  },
  'task': {
    'logLevel': 'trace',
    'logPath': `${Process.env.HOME}/Library/Logs/azog/azog-task.log`
  },
  'test': {
    'logLevel': 'trace',
    'logPath': `${Process.env.HOME}/Library/Logs/azog/azog-test.log`,
    'path': {
      'module': `${__dirname}/index.js`
    }
  }
})

Configuration.merge = function (path) {

  let paths = Is.array(path) ? path : [ path ]

  for (let _path of paths) {

    let configuration = Is.string(_path) ? require(Path.normalize(_path)) : _path
    let transform = {}

    transform.remove = Property
      .get(configuration, 'transform.remove', [])
      .map((value) => {
        return Is.regexp(value) ? value : new RegExp(value, 'gi')
      })
  
    transform.replace = Property
      .get(configuration, 'transform.replace', [])
      .map((value) => {
        return {
          'pattern': Is.regexp(value.pattern) ? value.pattern : new RegExp(value.pattern, 'gi'),
          'with': value.with // Is.regexp(value.with) ? value.with : new RegExp(value.with)
        }
      })

    configuration.transform = transform

    Object.setPrototypeOf(Configuration, Merge(Object.getPrototypeOf(Configuration), configuration))

  }

}

export default Configuration
