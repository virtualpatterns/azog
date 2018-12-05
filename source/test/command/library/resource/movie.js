import { assert as Assert } from 'chai'
import { Path } from '@virtualpatterns/mablung'

import { Command as Command } from '../../../../configuration'
import Movie from '../../../../command/library/resource/movie'

describe('movie', () => {

  describe('getToPath()', () => {
    [
      {
        'fromPath': 'The.Equalizer.2.2018.720p.BluRay.x264.MkvCage.ws.mkv',
        'toPath': Path.join(Command.path.processed, 'The Equalizer 2 (2018).mp4')
      },
      {
        'fromPath': 'Mother!.2017.720p.BluRay.x26.mp4',
        'toPath': Path.join(Command.path.processed, 'mother! (2017).mp4')
      },
      {
        'fromPath': 'Space.Guardians.2.2018.HDRip.XviD.AC3-EVO.avi',
        'toPath': Path.join(Command.path.processed, 'Space Guardians 2 (2018).mp4')
      },
      {
        'fromPath': 'They.Shall.Not.Grow.Old.1080p.x264.AAC.MVGroup.Forum.mp4',
        'toPath': Path.join(Command.path.processed, 'They Shall Not Grow Old (2018).mp4')
      },
      {
        'fromPath': 'Under.the.Silver.Lake.2018.1080p.WEB-DL.H264.AC3-EVO[EtHD].mkv',
        'toPath': Path.join(Command.path.processed, 'Under the Silver Lake (2019).mp4')
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
