// Configurable options
const options = {
    home: Deno.env.get('HOMEADDRESS') ?? 'laguna+beach',
    work: Deno.env.get('WORKADDRESS') ?? 'newport+beach',
    articles: Deno.env.get('ARTICLES') ?? 10,
    location: Deno.env.get('LOCATION') ?? [34.05,-118.24,'America%2FLos_Angeles'],
}

// initialize globals
let time = 0
let data = {}

// import oak middleware for deno http server
import { Application } from "https://deno.land/x/oak@v9.0.0/mod.ts";
import { oakCors } from "https://deno.land/x/cors@v1.2.2/mod.ts";


// Create a new oak application
const app = new Application();
app.use(oakCors({
    origin: '*',
}))

// handle GET requests to /
app.use(async (ctx) => {
    const data = await callData()
    ctx.response.body = await data
});
await app.listen({ port: 3000 });



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
    async function getWeather(){
        const weather = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${options.location[0]}&longitude=${options.location[1]}&hourly=relativehumitidy_2m,apparent_temperature,precipitation,cloudcover,windspeed_10m&temperature_unit=fahrenheit&windspeed_unit=mph&precipitation_unit=inch&timezone=${options.location[2]}`)
        return await weather.json()
    }

    // Parse News

    
    // Check if data needs to update + update, else return existing data from global
    if (time + 1800000 < new Date().getTime() || time === 0){
        time = new Date().getTime()
        data = {
            timeToWork: await getTimeToWork(),
            weather: await getWeather(),
        }
        console.log('refreshed data at ' + time)
    }
    return data
}


