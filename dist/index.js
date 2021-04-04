"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const cheerio_1 = __importDefault(require("cheerio"));
const AxiosInstance = axios_1.default.create();
const retailers = [
    {
        name: 'Amazon',
        url: 'https://www.amazon.com/gp/product/B08FC5L3RG/ref=ppx_yo_dt_b_search_asin_title?ie=UTF8&psc=1',
        version: 'Disc'
    },
    {
        name: 'Best Buy',
        url: 'https://www.bestbuy.com/site/sony-playstation-5-console/6426149.p?skuId=6426149',
        version: 'Disc'
    },
    {
        name: 'Gamestop',
        url: 'https://www.gamestop.com/video-games/playstation-5/consoles/products/playstation-5/B225169X.html',
        version: 'Disc'
    },
    {
        name: 'Best Buy',
        url: 'https://www.bestbuy.com/site/sony-playstation-5-digital-edition-console/6430161.p?skuId=6430161',
        version: 'Digital'
    },
    {
        name: 'Gamestop',
        url: 'https://www.gamestop.com/video-games/playstation-5/consoles/products/playstation-5-digital-edition/11108141.html',
        version: 'Digital'
    },
];
const checkSellerAvailability = async (retailer) => {
    let available = false;
    await AxiosInstance.get(retailer.url)
        .then((response) => {
        const html = response.data;
        const $ = cheerio_1.default.load(html);
        if (retailer.name === 'Amazon') {
            const elementToFind = $('#add-to-cart-button');
            if (elementToFind.length) {
                available = true;
            }
        }
        else if (retailer.name === 'Best Buy') {
            const elementToFind = $('.add-to-cart-button');
            if (elementToFind.text() === 'Add to Cart') {
                available = true;
            }
        }
        else if (retailer.name === 'Gamestop') {
            const elementToFind = $('.add-to-cart');
            if (elementToFind.text() === 'Add to Cart') {
                available = true;
            }
        }
    })
        .catch(e => {
        console.log(`Error retrieving information for PlayStation 5 (${retailer.version}) from ${retailer.name}. Availability is assumed to be false.`);
    });
    return available;
};
const checkSellers = async () => {
    let available = [];
    let unavailable = [];
    for (let retailer of retailers) {
        const availability = await checkSellerAvailability(retailer);
        console.log(availability);
        if (availability)
            available.push(retailer);
        else
            unavailable.push(retailer);
    }
    if (available.length)
        console.log('\u0007');
    return { available, unavailable };
};
const refreshData = () => {
    checkSellers().then(result => {
        console.log(`Below are the results for ${new Date()}`);
        console.log(result);
    });
    setTimeout(refreshData, 10000);
};
refreshData();
//# sourceMappingURL=index.js.map