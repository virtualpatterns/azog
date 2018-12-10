import { assert as Assert } from 'chai'

import Movie from '../../../library/resource/movie'

describe('movie', () => {

  describe('getToPath()', () => {

    [].forEach((test) => {

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
