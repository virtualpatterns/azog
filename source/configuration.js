import { Duration } from 'luxon'
import Is from '@pwn/is'
import Merge from 'deepmerge'
import OS from 'os'
import { Path, Process } from '@virtualpatterns/mablung'
import Property from 'object-path'

const MILLISECONDS_PER_MINUTE = 1000 * 60
const MILLISECONDS_PER_SECOND = 1000
const NANOSECONDS_PER_SECOND = 1000000000
const SECONDS_PER_MINUTE = 60

const Configuration = Object.create({
  'conversion': {
    'minutesToMilliseconds': (minutes) => minutes * MILLISECONDS_PER_MINUTE,
    'secondsToMilliseconds': (seconds) => seconds * MILLISECONDS_PER_SECOND,
    'secondsToMinutes': (seconds) => seconds / SECONDS_PER_MINUTE,
    'toDuration': ([ seconds, nanoseconds ]) => Duration.fromMillis((seconds + nanoseconds / NANOSECONDS_PER_SECOND) * MILLISECONDS_PER_SECOND), 
    'toPercent': (progress) => progress.percent.toFixed(2),
    'toMinutes': (minutes) => minutes.toFixed(2),
    'toSeconds': ([ seconds, nanoseconds ]) => (seconds + nanoseconds / NANOSECONDS_PER_SECOND).toFixed(2)
  },
  'extension': {
    'book': [ '.epub', '.mobi', '.pdf' ],
    'music': [ '.flac', '.m4a', '.mp3' ],
    'video': [ '.avi', '.m4v', '.mkv', '.mov', '.mp4' ],
    'other': [ '.rar', '.zip' ]      
  },
  'format': {
    'date': 'yyyy-LL-dd',
    'longDuration': 'hh\'h\' mm\'m\' ss.SSSS\'s\'',
    'shortDuration': 'ss.SSSS\'s\''
  },
  'key': {
    'movieDB': '',
    'tvDB': ''
  },
  'line': '-'.repeat(80),
  'logLevel': 'debug',
  'logPath': `${Process.env.HOME}/Deluge/Log/azog.log`,
  'path': {
    'processed': `${Process.env.HOME}/Deluge/Processed`,
    'failed': `${Process.env.HOME}/Deluge/Failed`,
    'ffmpeg': '/usr/local/bin/ffmpeg',
    'ffprobe': '/usr/local/bin/ffprobe',
    'rsync': '/usr/local/bin/rsync', // '/usr/bin/rsync',
    'library': {
      'from': {
        'movies': `${Process.env.HOME}/Deluge/Processed/Movies`,
        'moviesDocumentaries': `${Process.env.HOME}/Deluge/Processed/Movies (Documentaries)`,
        'moviesMiscellaneous': `${Process.env.HOME}/Deluge/Processed/Movies (Miscellaneous)`,
        'music': `${Process.env.HOME}/Deluge/Processed/Music`,
        'series': `${Process.env.HOME}/Deluge/Processed/TV Shows`,
        'seriesDocumentaries': `${Process.env.HOME}/Deluge/Processed/TV Shows (Documentaries)`
      },
      'to': 'BUCKBEAK.local:/Volumes/BUCKBEAK2/Media'
    }
  },
  'queue': {
    'autoStart': false,
    'concurrency': OS.cpus().length
  },
  'range': {
    'progressInSeconds':  [ 15.0, Infinity ],
    'videoDurationInMinutes':  [ 15.0, Infinity ]
  },
  'serversUrl': 'https://nordvpn.com/wp-admin/admin-ajax.php?action=servers_recommendations&filters={"country_id":38,"servers_groups":[15]}',
  'transform': {
    'remove': [ 
      /[()]/g,
      /\s{2,}/g,
      /^\s/,
      /\s$/,
      /\[.+]$/
    ],
    'replace': [
      { 
        'pattern': /\.+/g, 
        'with': ' ' 
      },
      { 
        'pattern': /-/g, 
        'with': ' ' 
      } 
    ]
  },
  'task': {
    'logLevel': 'debug',
    'logPath': `${Process.env.HOME}/Library/Logs/azog/azog-task.log`
  },
  'test': {
    'logLevel': 'debug',
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
        return new RegExp(value, 'gi')
      })
  
    transform.replace = Property
      .get(configuration, 'transfrom.replace', [])
      .map((value) => {
        return {
          'pattern': new RegExp(value.pattern, 'gi'),
          'with': new RegExp(value.with)
        }
      })

    configuration.transform = transform
  
    Object.setPrototypeOf(Configuration, Merge(Object.getPrototypeOf(Configuration), configuration))

  }

}

export default Configuration
