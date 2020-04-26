const app = require('./app');
const pup = require('puppeteer');

(async () => {
    "use strict";

    try {
        const browser = await pup.launch({headless: true});
        await app.init(browser);
        await app.connect();
        await app.run();
        await browser.close();
    }
    catch (e) {
        console.error(e);
    }
})();