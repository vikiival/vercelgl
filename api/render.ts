
const chrome = require('chrome-aws-lambda')
const puppeteer = require('puppeteer')

const getAbsoluteURL = (path: string) => {
  // if (process.env.NODE_ENV === 'development') {
    return `http://localhost:3000/${path}`
  // }
  // https://image.w.kodadot.xyz/ipfs/bafybeiaylihby4c5tqzl6tps35hfha5xjofyzk4ztpsj6nh7z3jhxeth3y/?hash=0xecfac00a67f88d51a47f06e7e73d7a436609e44760926a7712be9b73356061d8
  // return `https://image.w.kodadot.xyz/ipfs/bafybeiaylihby4c5tqzl6tps35hfha5xjofyzk4ztpsj6nh7z3jhxeth3y/${path}`
}

export default async (req: any, res: any) => {
  let {
    query: { hash, cid, resolution }
  } = req

  if (!hash) return res.status(400).end(`No model provided`)

  let browser

  if (process.env.NODE_ENV === 'production') {
    browser = await puppeteer.launch({
      args: chrome.args,
      defaultViewport: chrome.defaultViewport,
      executablePath: await chrome.executablePath,
      headless: chrome.headless,
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

  const url = getAbsoluteURL(`?hash=${hash}`)

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
