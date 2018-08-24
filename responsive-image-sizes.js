/**
 * Get the CSS width of an image in a page at different viewport widths
 *
 * Usage:
 *
 *     node responsive-image-sizes.js -h
 */

const puppeteer = require('puppeteer')
const color = require('ansi-colors')

const sleep = timeout => new Promise(r => setTimeout(r, timeout))

const argv = require('yargs')
  .options({
    url: {
      alias: 'u',
      describe: 'Page URL',
      demandOption: true,
    },
    selector: {
      alias: 's',
      describe: 'Image selector in the page',
      demandOption: true,
    },
    minviewport: {
      alias: 'min',
      describe: 'Minimum viewport width to check',
      default: 240,
      defaultDescription: '240: viewport width of some feature phones',
      type: 'number',
    },
    maxviewport: {
      alias: 'max',
      describe: 'Maximum viewport width to check',
      default: 1920,
      defaultDescription: '1920: full HD viewport width',
      type: 'number',
    },
    viewportstep: {
      alias: 'step',
      describe: 'Viewport width step',
      default: 10,
      type: 'number',
    },
    delay: {
      alias: 'd',
      describe: 'Delay after viewport resizing before checking image width',
      default: 500,
      type: 'number',
    },
  })
  .check(function(argv) {
    // waiting for https://github.com/yargs/yargs/issues/1079
    if (isNaN(argv.minviewport)) {
      throw new Error(color.red('Error: minviewport must be a number'))
    }
    if (isNaN(argv.maxviewport)) {
      throw new Error(color.red('Error: maxviewport must be a number'))
    }
    if (isNaN(argv.viewportstep)) {
      throw new Error(color.red('Error: viewportstep must be a number'))
    }
    if (isNaN(argv.delay)) {
      throw new Error(color.red('Error: delay must be a number'))
    }
    if (argv.maxviewport < argv.minviewport) {
      throw new Error(
        color.red('Error: maxviewport must be greater than minviewport'),
      )
    }
    return true
  })
  .help()
  .example(
    "$0 --url 'https://example.com/' --selector 'main img[srcset]:first-of-type'",
  )
  .example("$0 --u 'https://example.com/' --s 'main img[srcset]:first-of-type'")
  .wrap(null)
  .detectLocale(false).argv

const VIEWPORT = { width: argv.minviewport, height: 2000, deviceScaleFactor: 1 }
;(async () => {
  console.log(color.green('Launch headless Chrome'))
  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  console.log(color.green('Go to ' + argv.url))
  await page.goto(argv.url, { waitUntil: 'networkidle2' }).then(async () => {
    console.log(color.green('Checking sizes of image ' + argv.selector))
    while (VIEWPORT.width <= argv.maxviewport) {
      console.log(color.cyan('Viewport width: ' + VIEWPORT.width))
      // Set new viewport width
      await page.setViewport(VIEWPORT)

      // Give the browser some time to adjust layout, sometimes requiring JS
      await sleep(argv.delay)

      // Check image width
      // todo

      // Increment viewport width
      VIEWPORT.width += argv.step
    }
  })

  await page.browser().close()
})()
