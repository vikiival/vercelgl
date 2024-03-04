
const chrome = require('@sparticuz/chromium')
const puppeteer = require('puppeteer-core')

// const getAbsoluteURL = (hash: string, path?: string) => {
//   if (!process.env.NODE_ENV) {
//     return `http://localhost:3000/${hash}`
//   }
  
//   return `https://image.w.kodadot.xyz/ipfs/${path}/${hash}`
// }

// type ScreenshotRequest = {
// 	url: string
// 	settings?: Settings
// }

// export type Settings = {
// 	delay?: number;
// 	width?: number;
// 	height?: number;
// }


const performCanvasCapture = async (page: any, canvasSelector: string) => {
  try {
    // get the base64 image from the CANVAS targetted
    const base64 = await page.$eval(canvasSelector, el => {
      if (!el || el.tagName !== "CANVAS") return null
      return el.toDataURL()
    })
    if (!base64) throw new Error("No canvas found")
    // remove the base64 mimetype at the beginning of the string
    const pureBase64 = base64.replace(/^data:image\/png;base64,/, "")
    return Buffer.from(pureBase64, "base64")
  } catch (err) {
    return null
  }
}

const exePath =
    process.platform === "win32"
        ? "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe"
        : process.platform === "linux"
        ? "/usr/bin/google-chrome"
        : "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

async function getOptions(isDev: boolean) {
  let options;
  console.log('exePath:', exePath);
  if (isDev) {
      options = {
      args: [],
      executablePath: exePath,
      headless: 'new',
      };
  } else {
      // fetch executable from git (for free servers)
      // in case of prod, store this image in S3 to reduce network cost
      options = {
          args: [...chrome.args, '--hide-scrollbars', '--disable-web-security'],
          defaultViewport: chrome.defaultViewport,
          executablePath: await chrome.executablePath(
              `https://github.com/Sparticuz/chromium/releases/download/v116.0.0/chromium-v116.0.0-pack.tar`
          ),
          headless: chrome.headless,
          ignoreHTTPSErrors: true,
      };
  }
  return options;
}

export default async (req: any, res: any) => {
  let {
    // query: { hash, path, resolution },
    body,
    method
  } = req

  if (method !== 'POST') {
    // CORS https://vercel.com/guides/how-to-enable-cors
    res.setHeader('Access-Control-Allow-Credentials', true)
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
    res.setHeader(
      'Access-Control-Allow-Headers',
      'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    )
    return res.status(200).end()
  }

  if (!body) return res.status(400).end(`No body provided`)

  if (typeof body === 'object' && !body.url) return res.status(400).end(`No url provided`)

  const isProd = process.env.NODE_ENV === 'production'

  let browser

  const options = await getOptions(!isProd)
  browser = await puppeteer.launch(options);

  const page = await browser.newPage()

  await page.setViewport({ width: 600, height: 600 })

  // const url = getAbsoluteURL(`?hash=${hash}`, path)
  const url = body.url

  console.log('url', url)

  await page.goto(url);

  const selector = 'canvas';

  await page.waitForSelector(selector);

  const element = await performCanvasCapture(page, selector) // const element = page.$(selector)

  // const data = await page.screenshot({
  //   type: 'png'
  // })

  const data = element

  await browser.close()
  // Set the s-maxage property which caches the images then on the Vercel edge
  res.setHeader('Cache-Control', 's-maxage=10, stale-while-revalidate')
  res.setHeader('Content-Type', 'image/png')
  // CORS
  // res.setHeader('Access-Control-Allow-Headers', '*')
  res.setHeader('Access-Control-Allow-Credentials', true)
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  )
  res.end(data)
}
