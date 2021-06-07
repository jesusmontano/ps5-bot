import axios from 'axios'
import cheerio from 'cheerio'
import { Retailer } from './types'
require('dotenv').config()
const twilio = require('twilio')

const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN

const client = new twilio(accountSid, authToken)

client.messages
    .create({
        body: 'Hello! This is PS5 Bot.',
        from: process.env.TWILIO_PHONE_NUMBER,
        to: process.env.PERSONAL_PHONE_NUMBER,
    })
    .then((message) => console.log(message))

const AxiosInstance = axios.create()

const retailers: Retailer[] = [
    {
        name: 'Amazon',
        url: 'https://www.amazon.com/gp/product/B08FC5L3RG/ref=ppx_yo_dt_b_search_asin_title?ie=UTF8&psc=1',
        version: 'Disc',
    },
    {
        name: 'Best Buy',
        url: 'https://www.bestbuy.com/site/sony-playstation-5-console/6426149.p?skuId=6426149',
        version: 'Disc',
    },
    {
        name: 'Best Buy',
        url: 'https://www.bestbuy.com/site/sony-playstation-5-digital-edition-console/6430161.p?skuId=6430161',
        version: 'Digital',
    },
    {
        name: 'Gamestop',
        url: 'https://www.gamestop.com/video-games/playstation-5/consoles/products/playstation-5-digital-edition/11108141.html',
        version: 'Digital',
    },
]

const checkSellerAvailability = async (
    retailer: Retailer
): Promise<boolean> => {
    let available = false

    await AxiosInstance.get(retailer.url)
        .then((response) => {
            const html = response.data
            const $ = cheerio.load(html)
            if (retailer.name === 'Amazon') {
                const elementToFind = $('#add-to-cart-button')
                if (elementToFind.length) {
                    available = true
                }
            } else if (retailer.name === 'Best Buy') {
                const elementToFind = $('.add-to-cart-button')
                if (elementToFind.text() === 'Add to Cart') {
                    available = true
                }
            } else if (retailer.name === 'Gamestop') {
                const elementToFind = $('.add-to-cart')
                if (elementToFind.text() === 'Add to Cart') {
                    available = true
                }
            }
        })
        .catch((e) => {
            console.log(
                `Error retrieving information for PlayStation 5 (${retailer.version}) from ${retailer.name}. Availability is assumed to be false.`
            )
        })

    return available
}

const checkSellers = async (): Promise<{
    available: Retailer[]
    unavailable: Retailer[]
}> => {
    let available = []
    let unavailable = []

    for (let retailer of retailers) {
        const availability = await checkSellerAvailability(retailer)
        if (availability) available.push(retailer)
        else unavailable.push(retailer)
    }

    if (available.length) console.log('\u0007')

    return { available, unavailable }
}

const refreshData = (): void => {
    checkSellers().then((result) => {
        console.log(`Below are the results for ${new Date()}`)
        console.log(result)
    })
    setTimeout(refreshData, 10000)
}

refreshData()
