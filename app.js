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

            await page.goto(sections[i], {waitUntil: 'networkidle2'});

            // await page.screenshot({path: 'example.png'});
            let ids = await page.evaluate(() => {
                const items = document.querySelectorAll('#resultListItems > li.result-list__listing');
                debugger;
                console.log(items.length);
                let ids = [];

                for (const item of items)
                    ids.push(item.dataset.id);

                // ids.push(item.dataset.id);

                return ids;
            });

            console.log('ids', ids);

            for (const id of ids) {

                await page.goto(`https://www.immobilienscout24.de/expose/${id}#/`);

                let result = await page.evaluate(() => {

                    const mainCriterias = document.querySelectorAll('.mainCriteria');

                    return {
                        price: mainCriterias[0].querySelector('.is24qa-kaltmiete.is24-value').textContent,
                        rooms: mainCriterias[1].querySelector('.is24qa-zi.is24-value').textContent,
                        space: mainCriterias[2].querySelector('.is24qa-flaeche.is24-value').textContent
                    };
                });

                console.log(result);
                await fs.appendFile('data.csv', `${result.price};${result.rooms};${result.space}\n`);
            }
        }

        console.log('done');

        await browser.close();
    }
    catch (e) {
        console.error(e);
    }
})();