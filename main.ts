// Configurable options
const options = {
    home: Deno.env.get('HOMEADDRESS') ?? 'laguna+beach',
    work: Deno.env.get('WORKADDRESS') ?? 'newport+beach',
    articles: Deno.env.get('ARTICLES') ?? 10

}
// initialize globals
let time = 0
let data = {}

// import oak middleware for deno http server
import { Application } from "https://deno.land/x/oak@v9.0.0/mod.ts";

// import Deno DOM for parsing news
import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.14-alpha/deno-dom-wasm.ts";

// Create a new oak application
const app = new Application();

// handle GET requests to /
app.use(async (ctx) => {
    const data = await callData()
    ctx.response.body = await data
});
await app.listen({ port: 8000 });



// Records parsed data and the time it was parsed, and returns it if a new call is made within 30 minutes of the last call.
// If a new call is made after 30 minutes, the data is updated and the time is updated.
async function callData(){
    // Parse time to work
    async function getTimeToWork(){
        const page = await fetch(`https://www.google.com/search?q=how+long+from+${options.home}+to+${options.work}`)
        const html = await page.text()
        const time = html.match(/\d+ min/)??[0] ?? 'not found'
        return String(time)
    }

    // Parse Weather

    // Parse News
    async function getNews(){
        const page = await fetch('https://apnews.com/hub/ap-top-news')
        const html = await page.text()
        const doc = new DOMParser().parseFromString(html,'text/html')!
        const articles = await doc.querySelectorAll('div.FeedCard')
        const articleList = []
        for (let i = 0; i < options.articles; i++){
            articleList.push(articles[i].textContent)
        }
        return articleList
    }
    
    // Check if data needs to update + update, else return existing data from global
    if (time + 1800000 < new Date().getTime() || time === 0){
        time = new Date().getTime()
        data = {
            timeToWork: await getTimeToWork(),
            news: await getNews()
        }
        console.log('refreshed data at ' + time)
    }
    return data
}


