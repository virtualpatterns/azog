import { assert as Assert } from 'chai'
import { Path } from '@virtualpatterns/mablung'

import Configuration from '../../../configuration'
import Episode from '../../../library/resource/episode'

describe('episode', () => {

  describe('getToPath()', () => {

    [
      {
        'fromPath': 'ITV.Joanna.Lumleys.Silk.Road.Adventure.1of4.720p.HDTV.x264.AAC.MVGroup.org.mkv.mkv',
        'toPath': Path.join(Configuration.path.processed.episode, 'Joanna Lumley\'s Silk Road Adventure', 'Season 1', 'Joanna Lumley\'s Silk Road Adventure - 1x01 - Venice, Albania and Turkey.mp4')
      },
      {
        'fromPath': 'Ch4.Great.Canal.Journeys.Series.8.2of2.Marne-Rhine.Canal.720p.HDTV.x264.AAC.mkv[eztv].mkv',
        'toPath': Path.join(Configuration.path.processed.episode, 'Great Canal Journeys', 'Season 8', 'Great Canal Journeys - 8x02 - Marne-Rhine Canal.mp4')
      },
      {
        'fromPath': 'The.Flash.S01E01.mkv',
        'toPath': Path.join(Configuration.path.processed.episode, 'The Flash', 'Season 1', 'The Flash - 1x01 - Pilot.mp4')
      },
      {
        'fromPath': 'jimmy.kimmel.2018.11.19.bono.web.x264-tbs[eztv].mkv',
        'toPath': Path.join(Configuration.path.processed.episode, 'Jimmy Kimmel Live', 'Season 16', 'Jimmy Kimmel Live - 16x159 - Bono, Chris Rock, Will Ferrell, Kristen Bell, Channing Tatum, Snoop Dogg, Mila Kunis, Pharrell, Brad Paisley, Zoe Saldana.mp4')
      },
      // {
      //   'fromPath': 'Wonders Of Life What Is Life (1 of 5)[KRSH].mp4',
      //   'toPath': Path.join(Configuration.path.processed.episode, 'Wonders Of Life', 'Season 1', 'Wonders Of Life - 1x01 - X.mp4')
      // },
      {
        'fromPath': 'Wonders Of Life (1 of 5) What Is Life[KRSH].mp4',
        'toPath': Path.join(Configuration.path.processed.episode, 'Wonders of Life', 'Season 1', 'Wonders of Life - 1x01 - What is Life.mp4')
      }
    ].forEach((test) => {

      describe(`(when passing '${test.fromPath}')`, () => {
    
        let episode = null 

        before(() => {
          episode = Episode.createResource(test.fromPath)
        })
  
        it(`should return '${test.toPath}'`, async () => {
          Assert.equal(await episode.getToPath(), test.toPath)
        })

      })

    })

  })

})
