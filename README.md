# Den Outdoors Plan Comparison

When I was looking at [Den Outdoors](https://denoutdoors.com) recently, I wanted to compare all their plans based on square footage, estimated cost, etc. Their website doesn't show all this data on the index/search page, only the interior page for each plan, and the estimated cost is of course very situation dependent. So I wrote a script to scrape all the data from their site, and organize it into a single PDF catalog comparing the features I cared about.

I estimated a “minimum cost” very conservatively based on their guideline ($244.50/sq ft) plus overage (15%). Consider adjusting those values based on your own research.

This script scrapes their site using puppeteer and renders HTML with preact and then console.logs it to stdout, which you can then save to HTML to view in a browser or convert to PDF.

So if you have deno installed already:

    deno run -A mod.jsx > index.html
    open index.html
