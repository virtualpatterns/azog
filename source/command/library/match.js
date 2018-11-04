// import { FileSystem, Log, Path } from '@virtualpatterns/mablung'
import { Log, Path } from '@virtualpatterns/mablung'
import { DateTime } from 'luxon'
import MovieDB from 'moviedb'

import Configuration from '../../configuration'

const MEDIA_TYPE_MOVIE = 'movie'
const MEDIA_TYPE_TV = 'tv'

const Match = Object.create({})

Match.renameFile = async function (path) {
  Log.debug(`Match.renameFile('${Path.basename(path)}')`)

  let parentPath = Path.dirname(path)
  let inputExtension = Path.extname(path)
  let inputName = Path.basename(path, inputExtension)

  // Log.debug(await Match.getVideos('Weekend'))

  let outputName = inputName

  // await FileSystem.promisedRename(Path.join(parentPath, inputName), Path.join(parentPath, outputName))

  return Path.join(parentPath, `${outputName}${inputExtension}`)

}

// TVDB ... 3JY2IOFJVXC0H8LO
// MovieDB ... f3a8fcbd92ec64401c74b6aa1936c605
// Input is a path ... parent directory and name, all we care about is the name
// Output is an array of objects ... { movieName, year, confidence } or { tvName, year, season, episode, episodeName, confidence } 
// The Equalizer 2 (2018) [WEBRip] [720p] [YTS] [YIFY] ... { 'The Equalizer 2', 2018, N }
// The.Equalizer.2.2018.HDRip.XviD AC3-220x ... same
// The Flash 2014 S05E04 HDTV x264-SVA [eztv] ... { 'The Flash', 2014, 5, 4, N } 
// The.Flash.2014.S05E04.HDTV.x264-SVA[rartv] ... same
// Ink.Master.S11E10.Put.Up.or.Shut.Up.720p.PMNT.WEBRip.AAC2.0.H264- ... { 'Ink Master', N, 11, 10, N } 
// Ch4.Great.Canal.Journeys.Series.8.2of2.Marne-Rhine.Canal.720p ... { 'Great Canal Journeys', N, 8, 2, N }
// The.Daily.Show.2018.09.20.Tracey.Ullman.EXTENDED.720p.WEB ... { 'The Daily Show with Trevor Noah', N, S, E, N }
// James.Corden.2018.09.18.Tracey.Ullman.WEB ... unknown

Match.getVideos = async function (query) {
  Log.debug(`Match.getVideos('${query}')`)

  let allVideos = []

  let page = 0
  let numberOfPages = Infinity

  while (page < numberOfPages) {

    let results = await Match.getSomeVideos(query, page + 1)

    allVideos = allVideos.concat(results.videos)

    page = results.page
    numberOfPages = results.numberOfPages

  }

  return allVideos

}

Match.getSomeVideos = async function (query, page) {  
  Log.debug('Match.getSomeVideos()')

  const movieDB = MovieDB(Configuration.command.keys.movieDB)

  return new Promise((resolve, reject) => {

    movieDB.searchMulti({ 'page': page || 1, 'query': query }, (error, data) => {

      if (error) {

        Log.error('MovieDB.searchMulti({ \'query\': ... }, (error, data) => {})')
        Log.error(error)

        reject(error)

      }

      let videos = data.results
        .filter((video) => [ MEDIA_TYPE_MOVIE, MEDIA_TYPE_TV ].includes(video.media_type))
        .map((video) => { 

          switch (video.media_type) {
            case MEDIA_TYPE_MOVIE:

              return {
                'id': video.id,
                'title': video.title,
                'year': DateTime.fromISO(video.release_date).year
              }
    
            case MEDIA_TYPE_TV:
             
              return {
                'id': video.id,
                'title': video.name,
                'year': DateTime.fromISO(video.first_air_date).year
              }
    
            default:
              return {}
          }

        })

      resolve({
        'videos': videos, 
        'page': data.page, 
        'numberOfPages': data.total_pages
      })

    })

  })

}

export default Match
