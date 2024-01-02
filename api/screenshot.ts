
const chrome = require('@sparticuz/chromium')
const puppeteer = require('puppeteer-core')

const getAbsoluteURL = (hash: string, path?: string) => {
  if (!process.env.NODE_ENV) {
    return `http://localhost:3000/${hash}`
  }
  
  return `https://image.w.kodadot.xyz/ipfs/${path}/${hash}`
}

export default async (req: any, res: any) => {
  let {
    query: { hash, path, resolution }
  } = req

  const isProd = process.env.NODE_ENV === 'production'

  if (isProd && !path) return res.status(400).end(`No model provided`)

  if (!hash) return res.status(400).end(`No hash provided`)

  let browser

  if (isProd) {
    browser = await puppeteer.launch({
      args: chrome.args,
      defaultViewport: chrome.defaultViewport,
      executablePath: await chrome.executablePath(),
      headless: 'new',
      ignoreHTTPSErrors: true
    })
  } else {
    browser = await puppeteer.launch({
      headless: 'new'
    })
  }

  const page = await browser.newPage()

  if (resolution) {
    await page.setViewport({ width: resolution, height: resolution })
  } else {
    await page.setViewport({ width: 512, height: 512 })
  }

  const url = getAbsoluteURL(`?hash=${hash}`, path)

  console.log('url', url)

  await page.goto(url);

  const selector = 'canvas';

  await page.waitForSelector(selector);

  // const element = page.$(selector)

  const data = await page.screenshot({
    type: 'png'
  })

  await browser.close()
  // Set the s-maxage property which caches the images then on the Vercel edge
  res.setHeader('Cache-Control', 's-maxage=10, stale-while-revalidate')
  res.setHeader('Content-Type', 'image/png')
  // Write the image to the response with the specified Content-Type
  res.end(data)
}
