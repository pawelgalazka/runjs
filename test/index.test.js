/* eslint-env jest */
import * as api from '../lib/index'
import { RunJSError } from '../lib/common'

process.env.RUNJS_TEST = 'runjs test'

describe('api', () => {
  let logger

  beforeEach(() => {
    logger = {
      debug: jest.fn(),
      info: jest.fn(),
      log: jest.fn(),
      warning: jest.fn(),
      error: jest.fn()
    }
  })

  describe('run()', () => {
    describe('sync version', () => {
      describe('with stdio=pipe', () => {
        it('should execute basic shell commands', () => {
          const output = api.run('echo "echo test"', {stdio: 'pipe'}, logger)
          expect(output).toEqual('echo test\n')
          expect(logger.info).toHaveBeenCalledWith('echo "echo test"')
        })

        it('should throw an error if command fails', () => {
          expect(() => {
            api.run('node ./ghost.js', {stdio: 'pipe'}, logger)
          }).toThrow(RunJSError)
        })

        it('should have access to environment variables by default', () => {
          const output = api.run('echo $RUNJS_TEST', {stdio: 'pipe'}, logger)
          expect(output).toEqual('runjs test\n')
        })
      })

      describe('with stdio=inherit', () => {
        it('should execute basic shell commands', () => {
          const output = api.run('echo "echo test"', {}, logger)
          expect(output).toEqual(null)
          expect(logger.info).toHaveBeenCalledWith('echo "echo test"')
        })

        it('should throw an error if command fails', () => {
          expect(() => {
            api.run('node ./ghost.js', {}, logger)
          }).toThrow(RunJSError)
        })

        it('should have access to environment variables by default', () => {
          const output = api.run('echo $RUNJS_TEST', {}, logger)
          expect(output).toEqual(null)
        })
      })
    })

    describe('async version', () => {
      describe('with stdio=pipe', () => {
        it('should execute basic shell commands', (done) => {
          api.run('echo "echo test"', {async: true, stdio: 'pipe'}, logger).then((output) => {
            expect(output).toEqual('echo test\n')
            expect(logger.info).toHaveBeenCalledWith('echo "echo test"')
            done()
          })
        })

        it('should have access to environment variables by default', (done) => {
          api.run('echo $RUNJS_TEST', {async: true, stdio: 'pipe'}, logger).then((output) => {
            expect(output).toEqual('runjs test\n')
            done()
          })
        })

        it('should reject with an error if command fails', (done) => {
          api.run('node ./ghost.js', {async: true, stdio: 'pipe'}, logger).catch((error) => {
            expect(error.message).toEqual('Command failed: node ./ghost.js with exit code 1')
            done()
          })
        })
      })

      describe('with stdio=inherit', () => {
        it('should execute basic shell commands', (done) => {
          api.run('echo "echo test"', {async: true}, logger).then((output) => {
            expect(output).toEqual(null)
            expect(logger.info).toHaveBeenCalledWith('echo "echo test"')
            done()
          })
        })

        it('should have access to environment variables by default', (done) => {
          api.run('echo $RUNJS_TEST', {async: true}, logger).then((output) => {
            expect(output).toEqual(null)
            done()
          })
        })

        it('should reject with an error if command fails', (done) => {
          api.run('node ./ghost.js', {async: true}, logger).catch((error) => {
            expect(error.message).toEqual('Command failed: node ./ghost.js with exit code 1')
            done()
          })
        })
      })
    })
  })

  describe('ask()', () => {

  })
})
