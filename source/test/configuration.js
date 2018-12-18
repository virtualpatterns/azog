import { assert as Assert } from 'chai'

import Configuration from '../configuration'

describe('configuration', () => {

  describe('merge(path)', () => {

    before(() => {
      Configuration.merge({
        'transform': {
          'remove': [
            /a1b2c3/
          ],
          'replace': [
            {
              'pattern': /d4e5f6/,
              'with': 'g7h8i9'
            }
          ]
        }
      })
    })

    it('should include /a1b2c3/', () => {
      Assert.deepInclude(Configuration.transform.remove, /a1b2c3/)
    })

    it('should include /d4e5f6/', () => {
      Assert.deepInclude(Configuration.transform.replace, {
        'pattern': /d4e5f6/,
        'with': 'g7h8i9'
      })
    })

  })

})
