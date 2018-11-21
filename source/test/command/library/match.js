import { assert as Assert } from 'chai'
import { DateTime } from 'luxon'
import Is from '@pwn/is'
import { Path } from '@virtualpatterns/mablung'

import { Command as Configuration } from '../../../configuration'
import Match from '../../../command/library/match'

describe('match', () => {

  function shouldGetYearReleased (tests) {

    describe('getYearReleased', () => {

      for (let test of tests) {

        describe(`(when passing '${test.path}')`, () => {

          it(`should return ${test.yearReleased}`, () => {
            Assert.equal(Match.getYearReleased(test.path), test.yearReleased)
          })

        })

      }

    })

  }

  function shouldGetDateAired (tests) {

    describe('getDateAired', () => {

      for (let test of tests) {

        describe(`(when passing '${test.path}')`, () => {

          it(`should return ${Is.not.null(test.dateAired) ? test.dateAired.toISO() : null}`, () => {

            let dateAired = Match.getDateAired(test.path)

            if (Is.not.null(test.dateAired) &&
                Is.not.null(dateAired)) {
              Assert.ok(dateAired.equals(test.dateAired))
            }
            else if ( Is.null(test.dateAired) &&
                      Is.null(dateAired)) {
              // Do nothing
            }
            else {
              Assert.fail()
            }

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

  shouldGetYearReleased([
    {
      'path': 'abc.(1970)-def',
      'yearReleased': 1970
    },
    {
      'path': 'abc.1970.def',
      'yearReleased': 1970
    },
    {
      'path': 'abc.1970.S98E99-def',
      'yearReleased': 1970
    },
    {
      'path': 'abc.S98E99-def',
      'yearReleased': null
    }
  ])

  shouldGetDateAired([
    {
      'path': 'abc.1970.01.01-def',
      'dateAired': DateTime.fromObject({ 'year': 1970, 'month': 1, 'day': 1 })
    },
    {
      'path': 'jimmy.kimmel.2018.11.19.bono.web.x264-tbs[eztv].mkv',
      'dateAired': DateTime.fromObject({ 'year': 2018, 'month': 11, 'day': 19 })
    },
    {
      'path': 'abc.1970.01-01-def',
      'dateAired': null
    },
    {
      'path': 'abc.S98E99-def',
      'dateAired': null
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
      'inputPath': Path.join(Configuration.path.processing, 'The.Equalizer.2.2018.720p.BluRay.x264.MkvCage.ws.mkv'),
      'outputPath': Path.join(Configuration.path.processed, 'Movies', 'The Equalizer 2 (2018).mkv')
    },
    {
      'inputPath': Path.join(Configuration.path.processing, 'Mother!.2017.720p.BluRay.x26.mp4'),
      'outputPath': Path.join(Configuration.path.processed, 'Movies', 'mother! (2017).mp4')
    },
    {
      'inputPath': Path.join(Configuration.path.processing, 'Space.Guardians.2.2018.HDRip.XviD.AC3-EVO.avi'),
      'outputPath': Path.join(Configuration.path.processed, 'Movies', 'Space Guardians 2 (2018).avi')
    },
    {
      'inputPath': Path.join(Configuration.path.processing, 'Charmed.2018.S01E05.WEB.h264-TBS[eztv].mkv'),
      'outputPath': Path.join(Configuration.path.processed, 'TV Shows', 'Charmed (2018)', 'Season 1', 'Charmed (2018) - 1x05 - Other Woman.mkv')
    },
    {
      'inputPath': Path.join(Configuration.path.processing, 'ITV.Joanna.Lumleys.Silk.Road.Adventure.1of4.720p.HDTV.x264.AAC.MVGroup.org.mkv.mkv'),
      'outputPath': Path.join(Configuration.path.processed, 'TV Shows', 'Joanna Lumley\'s Silk Road Adventure', 'Season 1', 'Joanna Lumley\'s Silk Road Adventure - 1x01 - Venice, Albania and Turkey.mkv')
    },
    {
      'inputPath': Path.join(Configuration.path.processing, 'Ch4.Great.Canal.Journeys.Series.8.2of2.Marne-Rhine.Canal.720p.HDTV.x264.AAC.mkv[eztv].mkv'),
      'outputPath': Path.join(Configuration.path.processed, 'TV Shows', 'Great Canal Journeys', 'Season 8', 'Great Canal Journeys - 8x02 - Marne-Rhine Canal.mkv')
    },
    {
      'inputPath': Path.join(Configuration.path.processing, 'The.Flash.S01E01.mkv'),
      'outputPath': Path.join(Configuration.path.processed, 'TV Shows', 'The Flash', 'Season 1', 'The Flash - 1x01 - Pilot.mkv')
    },
    {
      'inputPath': Path.join(Configuration.path.processing, 'They.Shall.Not.Grow.Old.1080p.x264.AAC.MVGroup.Forum.mp4'),
      'outputPath': Path.join(Configuration.path.processed, 'Movies', 'They Shall Not Grow Old (2018).mp4')
    },
    {
      'inputPath': Path.join(Configuration.path.processing, 'jimmy.kimmel.2018.11.19.bono.web.x264-tbs[eztv].mkv'),
      'outputPath': Path.join(Configuration.path.processed, 'TV Shows', 'Jimmy Kimmel Live', 'Season 16', 'Jimmy Kimmel Live - 16x159 - Bono, Chris Rock, Will Ferrell, Kristen Bell, Channing Tatum, Snoop Dogg, Mila Kunis, Pharrell.mkv')
    } 
  ])

})
