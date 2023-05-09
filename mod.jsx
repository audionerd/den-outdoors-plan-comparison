/** @jsxImportSource https://esm.sh/preact */
/**
 * usage: deno run -A mod.jsx > index.html
 */
import puppeteer from "https://deno.land/x/puppeteer@16.2.0/mod.ts";
import render from 'https://esm.sh/preact-render-to-string'

// to avoid overloading the scraped server
const DELAY = 1000

async function fetchAllProductUrls () {
  const urls = [
    'https://denoutdoors.com/collections/small-house-and-aframe-plans',
    'https://denoutdoors.com/collections/small-house-and-aframe-plans?page=2',
    'https://denoutdoors.com/collections/small-house-and-aframe-plans?page=3'
  ]
  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  let results = []
  for (let url of urls) {
    await page.goto(url)
    let products = await page.evaluate(() => {
      let links = [...document.querySelectorAll('.grid-product__link')]
      return links.map(link => link.href)
    })
    results = [...results, ...products]
    await new Promise(resolve => setTimeout(resolve, DELAY))
  }
  await browser.close()

  // exclude gift card
  results = results.filter(result => result.includes('gift-card') == false)

  return results
}

async function fetchAllProductDetails (url) {
  const browser = await puppeteer.launch()
  let results = []
  for (let url of urls) {
    const page = await browser.newPage()
    await page.goto(url, { waitUntil: 'domcontentloaded' })
    let result = await page.evaluate(() => {
      // let htmlTitle = document.querySelector('title').innerText
      let ogTitle = [...document.querySelectorAll('meta')].find(m => m.getAttribute('property') == 'og:title').content
      let data = [...document.querySelector('.product-details--features table').querySelectorAll('td')].map(n => n.innerText.trim())
      let imgSrc = document.querySelector('div[data-index="0"] .product-image-main img').dataset.photoswipeSrc
      return {
        title: ogTitle,
        imgSrc,
        data
      }
    })
    await page.close()
    results.push({ ...result, url })
    await new Promise(resolve => setTimeout(resolve, DELAY))
  }
  await browser.close()
  return results
}

function Layout({ children }) {
  return (
    <html>
      <head>
        <style>{`
          html {
            height: 100%;
          }
          body {
            margin: 0;
            font-family: sans-serif;
            line-height: 1.3;
          }
          a {
            font-weight: 100;
            color: #0000cc;
            text-decoration: none;
          }
          header {
            margin: 2rem;
          }
          h1 {
            text-transform: uppercase;
            letter-spacing: 0.125em;
            font-weight: normal;
            margin-top: 4rem;
            margin-bottom: 1rem;
            font-size: 1rem;
            line-height: 1.5;
          }
          h1 + h2 {
            text-transform: uppercase;
            letter-spacing: 0.125em;
            font-weight: normal;
            margin-top: -1rem;
            margin-bottom: 1rem;
            font-size: 0.8125rem;
            color: #999;
            line-height: 1.5;
          }
          main {
            margin: 2rem;
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 4rem;
          }
          h3 {
            font-size: 2rem;
            margin: 0;
            margin-top: 1rem;
            margin-bottom: 0.5rem;
            height: 6rem;
            line-height: 1.1;
            display: flex;
            flex-direction: column;
            justify-content: flex-end;
          }
          h3, h3 a {
            font-weight: 500;
          }
          h3 + p {
            font-size: 1.25rem;
          }
          p {
            margin: 0;
          }
          img {
            display: block;
            width: auto;
            max-width: 100%;
            margin-top: 1rem;
            margin-bottom: 1rem;
          }
          div div:last-child {
            padding: 0.5rem;
            font-size: 0.875rem;
            opacity: 0.6;
          }
          span.estimate {
            font-family: monospace;
            font-size: 0.9375rem;
            opacity: 0.6;
            position: relative;
            top: 0.25rem;
            float: right;
          }
        `}
        </style>
      </head>
      <body>
        <header>
          <h1>
            Den Outdoor Plans (by sq. ft.)
          </h1>
          <h2>
            {new Intl.DateTimeFormat('en-GB', {
              month: 'short',
              year: 'numeric',
              day: '2-digit'
            }).format(new Date())}
          </h2>
        </header>
        <main>
          {children}
        </main>
      </body>
    </html>
  )
}

function Catalog({ results }) {
  const PRICE_PER_SQ_FT = 244.50
  const OVERAGE = 1.15

  const usd = Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format

  for (let result of results) {
    result.sqft = parseInt(result.data[0].split(' ')[0].replace(',', ''))

    let heightStr
    if (result.data[1].includes('roof peak')) {
      heightStr = result.data[1]
    } else {
      heightStr = result.data[2]
    }
    result.heightInFt = parseInt(heightStr.replace(/^Approx\. /, '').split(`'`)[0])
    result.imgSrc = `https:${result.imgSrc}`
  }
  let output = results.sort((a, b) => a.sqft - b.sqft)

  return output.map(({ title, imgSrc, data, uri, sqft, heightInFt }) => {
    let estimate = sqft * PRICE_PER_SQ_FT * OVERAGE
    return (
      <div>
        <h3>
          <a href={uri}>
            {title}
          </a>
        </h3>
        <p>{sqft} sq ft <span class="estimate">{usd(estimate)}</span></p>
        <p>{heightInFt}’ tall</p>
        <div>
          <img src={imgSrc} />
        </div>
        <div>
          {data.map(x => <>{x}<br /></>)}
        </div>
      </div>
    )
  })
}

function Page({ results }) {
  return <Layout><Catalog results={results} /></Layout>
}

const urls = await fetchAllProductUrls()
const results = await fetchAllProductDetails(urls)

console.log(render(Page({ results })))
