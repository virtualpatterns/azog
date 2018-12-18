import { assert as Assert } from 'chai'
import { Path } from '@virtualpatterns/mablung'

import Configuration from '../../../configuration'
import Movie from '../../../library/resource/movie'

describe('movie', () => {

  describe('getToPath()', () => {

    [
      {
        'fromPath': 'In Extremis.2018.HDRip.XviD.AC3-EVO',
        'toPath': Path.join(Configuration.path.processed.movie, 'In Extremis (2017).mp4')
      }
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
