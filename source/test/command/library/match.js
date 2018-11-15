import { assert as Assert } from 'chai'
import { Path } from '@virtualpatterns/mablung'

import Configuration from '../../../configuration'
import Match from '../../../command/library/match'

describe('match', () => {

  function shouldGetYear (tests) {

    describe('getYear', () => {

      for (let test of tests) {

        describe(`(when passing '${test.path}')`, () => {

          it(`should return ${test.year}`, () => {
            Assert.equal(Match.getYear(test.path), test.year)
          })

        })

      }

    })

  }

  function shouldGetSeason (tests) {

    describe('getSeason', () => {

      for (let test of tests) {

        describe(`(when passing '${test.path}')`, () => {

          it(`should produce ${test.season}`, () => {
            Assert.equal(Match.getSeason(test.path), test.season)
          })

        })

      }

    })

  }

  function shouldGetEpisode (tests) {

    describe('getEpisode', () => {

      for (let test of tests) {

        describe(`(when passing '${test.path}')`, () => {
      
          it(`should produce ${test.episode}`, () => {
            Assert.equal(Match.getEpisode(test.path), test.episode)
          })

        })

      }

    })

  }

  function shouldGetName (tests) {

    describe('getName', () => {

      for (let test of tests) {

        describe(`(when passing '${test.path}')`, () => {
      
          it(`should produce '${test.name}'`, () => {
            Assert.equal(Match.getName(test.path), test.name)
          })

        })

      }

    })

  }

  function shouldGetPath (tests) {

    describe('getPath', () => {

      for (let test of tests) {

        describe(`(when passing '${test.inputPath}')`, () => {
      
          it(`should produce '${test.outputPath}'`, async () => {
            Assert.equal(await Match.getPath(test.inputPath), test.outputPath)
          })

        })

      }

    })

  }

  shouldGetYear([
    {
      'path': 'abc.(1970)-def',
      'year': 1970
    },
    {
      'path': 'abc.1970.def',
      'year': 1970
    },
    {
      'path': 'abc.1970.S98E99-def',
      'year': 1970
    },
    {
      'path': 'abc.S98E99-def',
      'year': null
    }
  ])

  shouldGetSeason([
    {
      'path': 'abc.1970.S98E99-def',
      'season': 98
    },
    {
      'path': 'the.abc.S01E01',
      'season': 1
    },
    {
      'path': 'abc - 98x99 - def',
      'season': 98
    },
    {
      'path': 'abc.series.98.97.of.99-def',
      'season': 98
    },
    {
      'path': 'abc.97.of.99-def',
      'season': null
    },
    {
      'path': 'abc.1970.01.01-def',
      'season': null
    }
  ])

  shouldGetEpisode([
    {
      'path': 'abc.1970.S98E99-def',
      'episode': 99
    },
    {
      'path': 'the.abc.S01E01',
      'episode': 1
    },
    {
      'path': 'abc - 98x99 - def',
      'episode': 99
    },
    {
      'path': 'abc.series.98.97of99-def',
      'episode': 97
    },
    {
      'path': 'abc.part.97-def',
      'episode': 97
    },
    {
      'path': 'abc.series.98-def',
      'episode': null
    },
    {
      'path': 'abc.1970.01.01-def',
      'episode': null
    }
  ])

  shouldGetName([
    {
      'path': 'abc.1970.S98E99-def',
      'name': 'abc'
    },
    {
      'path': 'The.Flash.S01E01',
      'name': 'The Flash'
    },
    {
      'path': 'abc.(1970).S98E99-def',
      'name': 'abc'
    },
    {
      'path': 'abc - 98x99 - def',
      'name': 'abc'
    },
    {
      'path': 'ch4-abc.series.98.97of99-def',
      'name': 'abc'
    },
    {
      'path': 'itv-abc.part.97.of.99-def',
      'name': 'abc'
    }
  ])

  shouldGetPath([
    {
      'inputPath': Path.join(Configuration.command.path.processing, 'The.Equalizer.2.2018.720p.BluRay.x264.MkvCage.ws.mkv'),
      'outputPath': Path.join(Configuration.command.path.processed, 'Movies', 'The Equalizer 2 (2018).mkv')
    },
    {
      'inputPath': Path.join(Configuration.command.path.processing, 'Mother!.2017.720p.BluRay.x26.mp4'),
      'outputPath': Path.join(Configuration.command.path.processed, 'Movies', 'mother! (2017).mp4')
    },
    {
      'inputPath': Path.join(Configuration.command.path.processing, 'Space.Guardians.2.2018.HDRip.XviD.AC3-EVO.avi'),
      'outputPath': Path.join(Configuration.command.path.processed, 'Movies', 'Space Guardians 2 (2018).avi')
    },
    {
      'inputPath': Path.join(Configuration.command.path.processing, 'Charmed.2018.S01E05.WEB.h264-TBS[eztv].mkv'),
      'outputPath': Path.join(Configuration.command.path.processed, 'TV Shows', 'Charmed (2018)', 'Season 1', 'Charmed (2018) - 1x05 - Other Woman.mkv')
    },
    {
      'inputPath': Path.join(Configuration.command.path.processing, 'ITV.Joanna.Lumleys.Silk.Road.Adventure.1of4.720p.HDTV.x264.AAC.MVGroup.org.mkv.mkv'),
      'outputPath': Path.join(Configuration.command.path.processed, 'TV Shows', 'Joanna Lumley\'s Silk Road Adventure', 'Season 1', 'Joanna Lumley\'s Silk Road Adventure - 1x01 - Venice, Albania and Turkey.mkv')
    },
    {
      'inputPath': Path.join(Configuration.command.path.processing, 'Ch4.Great.Canal.Journeys.Series.8.2of2.Marne-Rhine.Canal.720p.HDTV.x264.AAC.mkv[eztv].mkv'),
      'outputPath': Path.join(Configuration.command.path.processed, 'TV Shows', 'Great Canal Journeys', 'Season 8', 'Great Canal Journeys - 8x02 - Marne-Rhine Canal.mkv')
    },
    {
      'inputPath': Path.join(Configuration.command.path.processing, 'The.Flash.S01E01.mkv'),
      'outputPath': Path.join(Configuration.command.path.processed, 'TV Shows', 'The Flash', 'Season 1', 'The Flash - 1x01 - Pilot.mkv')
    },
    {
      'inputPath': Path.join(Configuration.command.path.processing, 'They.Shall.Not.Grow.Old.1080p.x264.AAC.MVGroup.Forum.mp4'),
      'outputPath': Path.join(Configuration.command.path.processed, 'Movies', 'They Shall Not Grow Old (2018).mp4')
    }
    // 
  ])

})
