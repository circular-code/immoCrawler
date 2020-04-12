const pup = require('puppeteer');
const fs = require('fs-extra');

(async function main () {

    "use strict";

    try {

        const browser = await pup.launch({headless: false});
        const page = await browser.newPage();
        page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36");

        await fs.writeFile('data.csv', 'id;\n');

        const sections = [
            'https://www.immobilienscout24.de/Suche/radius/wohnung-mieten?centerofsearchaddress=Stuttgart;;;1276001039;Baden-W%C3%BCrttemberg;&geocoordinates=48.77899;9.17686;10.0&enteredFrom=one_step_search',
        ];

        for (let i = 0; i < sections.length; i++) {

            await page.goto(sections[i]);

            // await page.screenshot({path: 'example.png'});

            await page.waitForSelector('#resultListItems');

            const items = await page.$$('#resultListItems > li');

            console.log(items.length);
            // console.log(items[0]);
            // let ids = [];

            for (const item of items) {
                var ids = await item.$eval('li', (li) => {
                    return li.dataset.id;
                });

                // ids.push(item.dataset.id);

                console.log('ids', ids);
            }

            // for (let id of ids) {

            //     await page.goto(`https://www.immobilienscout24.de/expose/${id}#/`);

                // let price = await item.$eval('.price span', (span) => {
                //     return span.innerText.trim();
                // });

                // price = price.replace(/ü/g, 'ue');
                // price = price.replace(/–/g, '-');
                // price = price.trim();

            //     await fs.appendFile('data.csv', `${id};\n`);
            // }
        }

        console.log('done');
        await browser.close();
    }
    catch (e) {
        console.log(e);
    }
})();