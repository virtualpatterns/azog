import { assert as Assert } from 'chai'
import { Path } from '@virtualpatterns/mablung'

import Configuration from '../../../configuration'
import Movie from '../../../library/resource/movie'

describe('movie', () => {

  describe('getToPath()', () => {

    [
      {
        'fromPath': 'In Extremis.2017.HDRip.XviD.AC3-EVO',
        'toPath': Path.join(Configuration.path.processed.movie, 'In Extremis (2017).mp4')
      },
      // {
      //   'fromPath': 'Earth.From.Outer.Space.1080p.HDTV.x264.AAC.MVGroup.org.mp4',
      //   'toPath': Path.join(Configuration.path.processed.movie, '...mp4')
      // },
      {
        'fromPath': 'A.Day.in.the.Life.of.Earth.2018.mkv',
        'toPath': Path.join(Configuration.path.processed.movie, 'A Day in the Life of Earth (2018).mp4')
      }
      // ,
      // {
      //   'fromPath': 'Earthlings.10Th.Anniversary.Edition.2017.720P.Webrip.X265.m4v',
      //   'toPath': Path.join(Configuration.path.processed.movie, '')
      // }
    ].forEach((test) => {

      describe(`(when passing '${test.fromPath}')`, () => {
    
        let movie = null 

        before(() => {
          movie = Movie.createResource(test.fromPath)
        })
  
        it(`should return '${test.toPath}'`, async () => {
          Assert.equal(await movie.getToPath(), test.toPath)
        })

      })

    })

  })

})
