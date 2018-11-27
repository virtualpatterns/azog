import { assert as Assert } from 'chai'
import { Path } from '@virtualpatterns/mablung'

import { Command as Command } from '../../../../configuration'
import Episode from '../../../../command/library/resource/episode'

describe('episode', () => {

  describe('getToPath()', () => {

    [
      {
        'fromPath': 'Charmed.2018.S01E05.WEB.h264-TBS[eztv].mkv',
        'toPath': Path.join(Command.path.processed, 'Charmed (2018)', 'Season 1', 'Charmed (2018) - 1x05 - Other Woman.mp4')
      },
      {
        'fromPath': 'ITV.Joanna.Lumleys.Silk.Road.Adventure.1of4.720p.HDTV.x264.AAC.MVGroup.org.mkv.mkv',
        'toPath': Path.join(Command.path.processed, 'Joanna Lumley\'s Silk Road Adventure', 'Season 1', 'Joanna Lumley\'s Silk Road Adventure - 1x01 - Venice, Albania and Turkey.mp4')
      },
      {
        'fromPath': 'Ch4.Great.Canal.Journeys.Series.8.2of2.Marne-Rhine.Canal.720p.HDTV.x264.AAC.mkv[eztv].mkv',
        'toPath': Path.join(Command.path.processed, 'Great Canal Journeys', 'Season 8', 'Great Canal Journeys - 8x02 - Marne-Rhine Canal.mp4')
      },
      {
        'fromPath': 'The.Flash.S01E01.mkv',
        'toPath': Path.join(Command.path.processed, 'The Flash', 'Season 1', 'The Flash - 1x01 - Pilot.mp4')
      },
      {
        'fromPath': 'jimmy.kimmel.2018.11.19.bono.web.x264-tbs[eztv].mkv',
        'toPath': Path.join(Command.path.processed, 'Jimmy Kimmel Live', 'Season 16', 'Jimmy Kimmel Live - 16x159 - Bono, Chris Rock, Will Ferrell, Kristen Bell, Channing Tatum, Snoop Dogg, Mila Kunis, Pharrell, Brad Paisley, Zoe Saldana.mp4')
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
