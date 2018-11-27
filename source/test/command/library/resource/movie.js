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
      // {
      //   'fromPath': 'Charmed.2018.S01E05.WEB.h264-TBS[eztv].mkv',
      //   'toPath': Path.join(Command.path.processed, 'Charmed (2018)', 'Season 1', 'Charmed (2018) - 1x05 - Other Woman.mkv')
      // },
      // {
      //   'fromPath': 'ITV.Joanna.Lumleys.Silk.Road.Adventure.1of4.720p.HDTV.x264.AAC.MVGroup.org.mkv.mkv',
      //   'toPath': Path.join(Command.path.processed, 'Joanna Lumley\'s Silk Road Adventure', 'Season 1', 'Joanna Lumley\'s Silk Road Adventure - 1x01 - Venice, Albania and Turkey.mkv')
      // },
      // {
      //   'fromPath': 'Ch4.Great.Canal.Journeys.Series.8.2of2.Marne-Rhine.Canal.720p.HDTV.x264.AAC.mkv[eztv].mkv',
      //   'toPath': Path.join(Command.path.processed, 'Great Canal Journeys', 'Season 8', 'Great Canal Journeys - 8x02 - Marne-Rhine Canal.mkv')
      // },
      // {
      //   'fromPath': 'The.Flash.S01E01.mkv',
      //   'toPath': Path.join(Command.path.processed, 'The Flash', 'Season 1', 'The Flash - 1x01 - Pilot.mkv')
      // },
      {
        'fromPath': 'They.Shall.Not.Grow.Old.1080p.x264.AAC.MVGroup.Forum.mp4',
        'toPath': Path.join(Command.path.processed, 'They Shall Not Grow Old (2018).mp4')
      }
      // {
      //   'fromPath': 'jimmy.kimmel.2018.11.19.bono.web.x264-tbs[eztv].mkv',
      //   'toPath': Path.join(Command.path.processed, 'Jimmy Kimmel Live', 'Season 16', 'Jimmy Kimmel Live - 16x159 - Bono, Chris Rock, Will Ferrell, Kristen Bell, Channing Tatum, Snoop Dogg, Mila Kunis, Pharrell, Brad Paisley, Zoe Saldana.mkv')
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
