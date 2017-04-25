import chalk from 'chalk'
import childProcess from 'child_process'
import template from 'lodash.template'
import fs from 'fs'
import path from 'path'
import readline from 'readline'
import { RunJSError } from './common'

export const logger = {
  debug: (...args) => {
    console.log(chalk.blue(...args))
  },
  info: (...args) => {
    console.log(chalk.bold(...args))
  },
  log: (...args) => {
    console.log(...args)
  },
  warning: (...args) => {
    console.warn(chalk.yellow(...args))
  },
  error: (...args) => {
    console.error(chalk.red(...args))
  }
}

const loggerAlias = logger

function runSync (command, options) {
  try {
    const buffer = childProcess.execSync(command, options)
    if (buffer) {
      return buffer.toString()
    }
    return buffer
  } catch (error) {
    throw new RunJSError(error.message)
  }
}

function runAsync (command, options) {
  return new Promise((resolve, reject) => {
    const asyncProcess = childProcess.spawn(command, options)
    let output = null

    asyncProcess.on('error', (error) => {
      reject(new Error(`Failed to start command: ${command}; ${error}`))
    })

    asyncProcess.on('close', (exitCode) => {
      if (exitCode === 0) {
        resolve(output)
      } else {
        reject(new Error(`Command failed: ${command} with exit code ${exitCode}`))
      }
    })

    if (options.stdio === 'pipe') {
      asyncProcess.stdout.on('data', (buffer) => {
        output = buffer.toString()
      })
    }

    if (options.timeout) {
      setTimeout(() => {
        asyncProcess.kill()
        reject(new Error(`Command timeout: ${command}`))
      }, options.timeout)
    }
  })
}

export function run (command, options = {}, logger = loggerAlias) {
  const binPath = path.resolve('./node_modules/.bin')

  // Pick relevant option keys and set default values
  options = {
    env: options.env || process.env,
    cwd: options.cwd,
    async: !!options.async,
    stdio: options.stdio || 'inherit',
    timeout: options.timeout,
    shell: true
  }

  // Include in PATH node_modules bin path
  options.env.PATH = [binPath, options.env.PATH || process.env.PATH].join(path.delimiter)

  logger.info(command)

  // Handle async call
  if (options.async) {
    return runAsync(command, options)
  }

  // Handle sync call by default
  return runSync(command, options)
}

export function generate (src, dst, context) {
  console.log(`Generating ${dst} from template ${src}`)
  let templateString = fs.readFileSync(src)
  let content = template(templateString)(context)
  fs.writeFileSync(dst, content)
}

export function ask (question) {
  const readlineInterface = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        readlineInterface.question(question + ' ', (answer) => {
          resolve(answer)
          readlineInterface.close()
        })
      } catch (error) {
        reject(error)
        readlineInterface.close()
      }
    }, 0)
  })
}
