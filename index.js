const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

async function scrapeShopifyProductPage(url) {
    const browser = await puppeteer.launch({
        headless: true
    }); // You can set headless to false for debugging

    const page = await browser.newPage();

    // Set up some extra options for stealthiness
    await page.setExtraHTTPHeaders({
        'Accept-Language': 'en-US,en;q=0.9', // Set preferred languages
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.138 Safari/537.36' // Set a common user agent
    });

    await page.setViewport({
        width: 1366, height: 768
    }); // Set a common viewport size

    // Navigate to the product page
    await page.goto(url, { waitUntil: 'networkidle2' });

    // Extract product data
    const productData = await page.evaluate(() => {
        // Logo
        const logo = document.querySelector('[class*="styles_thumbnailWrapper"] img').getAttribute('src').split('?auto=').shift();

        // Url
        const url = location.href;

        // Title
        const title = document.querySelector('h1').innerText;

        // Sub title
        const sub_title = document.querySelector('[class*="styles_container"] [class*="styles_content"] .items-start > div:nth-child(2)').innerText;

        // Rating (stars)
        const rating = +document.querySelector('[data-test="reviews-summary"] > div:nth-child(2) > div:nth-child(2) > span:nth-child(1)').innerText.replace('/5','');

        // Reviews
        const reviews = +document.querySelector('[data-test="reviews-summary"] > div:nth-child(2) > div:nth-child(2) > span:nth-child(2)').innerText.replace(' reviews','');

        // Followers
        const followers = +document.querySelector('[class*="styles_container"] [class*="styles_content"] div > b').innerText.replace(' followers','');

        return { logo, url, title, sub_title, rating, reviews, followers };
    });

    await browser.close();
    return productData;
}

// Example usage
const url = 'url to the product page';

scrapeShopifyProductPage(url).then(productData => {
    console.log(productData);
}).catch(err => console.error(err));
