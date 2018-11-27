import { assert as Assert } from 'chai'
import { DateTime } from 'luxon'
import Is from '@pwn/is'

import Video from '../../../../command/library/resource/video'

describe('video', () => {

  describe('getTitle(path)', () => {

    [
      {
        'path': 'abc.1970.S98E99-def',
        'title': 'abc'
      },
      {
        'path': 'The.Flash.S01E01',
        'title': 'The Flash'
      },
      {
        'path': 'abc.(1970).S98E99-def',
        'title': 'abc'
      },
      {
        'path': 'abc - 98x99 - def',
        'title': 'abc'
      },
      {
        'path': 'ch4-abc.series.98.97of99-def',
        'title': 'abc'
      },
      {
        'path': 'itv-abc.part.97.of.99-def',
        'title': 'abc'
      }
    ].forEach((test) => {

      describe(`(when passing '${test.path}')`, () => {
    
        it(`should return '${test.name}'`, () => {
          Assert.equal(Video.getTitle(test.path), test.title)
        })

      })

    })

  })

  describe('getYearReleased(path)', () => {

    [
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
    ].forEach((test) => {

      describe(`(when passing '${test.path}')`, () => {

        it(`should return ${test.yearReleased}`, () => {
          Assert.equal(Video.getYearReleased(test.path), test.yearReleased)
        })

      })

    })

  })

  describe('getDateAired(path)', () => {

    [
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
    ].forEach((test) => {

      describe(`(when passing '${test.path}')`, () => {

        it(`should return ${Is.not.null(test.dateAired) ? test.dateAired.toISO() : null}`, () => {

          let dateAired = Video.getDateAired(test.path)

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

    })

  })

  describe('getSeasonNumber(path)', () => {

    [
      {
        'path': 'abc.1970.S98E99-def',
        'seasonNumber': 98
      },
      {
        'path': 'the.abc.S01E01',
        'seasonNumber': 1
      },
      {
        'path': 'abc - 98x99 - def',
        'seasonNumber': 98
      },
      {
        'path': 'abc.series.98.97.of.99-def',
        'seasonNumber': 98
      },
      {
        'path': 'abc.97.of.99-def',
        'seasonNumber': null
      },
      {
        'path': 'abc.1970.01.01-def',
        'seasonNumber': null
      }
    ].forEach((test) => {

      describe(`(when passing '${test.path}')`, () => {

        it(`should return ${test.season}`, () => {
          Assert.equal(Video.getSeasonNumber(test.path), test.seasonNumber)
        })

      })

    })

  })

  describe('getEpisodeNumber(path)', () => {

    [
      {
        'path': 'abc.1970.S98E99-def',
        'episodeNumber': 99
      },
      {
        'path': 'the.abc.S01E01',
        'episodeNumber': 1
      },
      {
        'path': 'abc - 98x99 - def',
        'episodeNumber': 99
      },
      {
        'path': 'abc.series.98.97of99-def',
        'episodeNumber': 97
      },
      {
        'path': 'abc.part.97-def',
        'episodeNumber': 97
      },
      {
        'path': 'abc.series.98-def',
        'episodeNumber': null
      },
      {
        'path': 'abc.1970.01.01-def',
        'episodeNumber': null
      }
    ].forEach((test) => {

      describe(`(when passing '${test.path}')`, () => {
    
        it(`should return ${test.episode}`, () => {
          Assert.equal(Video.getEpisodeNumber(test.path), test.episodeNumber)
        })

      })

    })

  })

})
