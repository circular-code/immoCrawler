// const fs = require('fs-extra');
const mysql = require('mysql');

const app = {
    page: null,
    links: ['https://www.immobilienscout24.de/Suche/radius/wohnung-mieten?centerofsearchaddress=Stuttgart;;;1276001039;Baden-W%C3%BCrttemberg;&geocoordinates=48.77899;9.17686;10.0&enteredFrom=one_step_search'],
    con: null,
    init: async (browser) => {
        app.page = await browser.newPage();
        app.page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36");

        // await fs.writeFile('data.csv', 'id;\n');
    },
    run: async () => {
        for (let i = 0; i < app.links.length; i++) {

            await app.page.goto(app.links[i], {waitUntil: 'networkidle0'});

            const ids = await app.getIds();

            for (const id of ids)
                await app.getDetails(id);
        }

        console.log('done');
    },
    connect: async () => {
        app.con = mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'root',
            database: 'immodb',
            insecureAuth : true
        });

        app.con.connect((err) => {
            if (err)
                return console.log('Error connecting to Db', err);

            console.log('connected to db');
            app.connectionEstablished = true;
        });
    },
    getIds: async () => {
        return await app.page.evaluate(() => {
            const items = document.querySelectorAll('#resultListItems > li.result-list__listing');

            console.log(items.length);
            let ids = [];

            for (const item of items)
                ids.push(item.dataset.id);

            return ids;
        });
    },
    getDetails: async (id) => {
        await app.page.goto(`https://www.immobilienscout24.de/expose/${id}#/`);

        const result = await app.page.evaluate((ad) => {

            function extractNumberFromString (string) {
                if (!string)
                    return null;
                return parseFloat(string.trim().replace('.','').replace('€','').replace('+','').replace(',','.'));
            }

            function getNumber (elem) {
                if (!elem)
                    return null;
                return extractNumberFromString(elem.textContent);
            }

            function getText (elem) {
                if (!elem)
                    return null;
                return elem.textContent.trim();
            }

            const content = document.querySelector('.is24-ex-details');
            if (!content)
                return;

            let features = document.querySelector('.criteriagroup.boolean-listing');
            if (features) {
                features = Array.prototype.slice.call(features.querySelectorAll('.palm-hide'));
                features = features.map(feature => {
                    return feature.textContent;
                });
            }
            else
                features = [];

            const floorsText = (content.querySelector('.is24qa-etage ') || '').textContent;

            debugger;

            return {
                immoId: extractNumberFromString(location.pathname.replace('/expose/','')),
                coldRent: getNumber(content.querySelector('.is24qa-kaltmiete.is24-value')),
                rooms: getNumber(content.querySelector('.is24qa-zi.is24-value')),
                space: getNumber(content.querySelector('.is24qa-flaeche.is24-value')),
                zip: getNumber(content.querySelector('.zip-region-and-country')),
                features: features.join('|') || null,
                type: getText(content.querySelector('.is24qa-typ')),
                floor: floorsText ? extractNumberFromString(floorsText.split(' von ')[0]) : null,
                totalFloors: floorsText ? extractNumberFromString(floorsText.split(' von ')[1]) : null,
                bedrooms: getNumber(content.querySelector('.is24qa-schlafzimmer')),
                bathrooms: getNumber(content.querySelector('.is24qa-badezimmer')),
                garage: getText(content.querySelector('.is24qa-garage-stellplatz')),
                additionalCosts: getNumber(content.querySelector('.is24qa-nebenkosten')),
                heatingCosts: getNumber(content.querySelector('.is24qa-heizkosten')),
                totalRent: getNumber(content.querySelector('.is24qa-gesamtmiete')),
                damage: getNumber(content.querySelector('.is24qa-kaution-o-genossenschaftsanteile')),
                garageRent: getNumber(content.querySelector('.is24qa-miete-fuer-garagestellplatz')),
                age: getNumber(content.querySelector('.is24qa-baujahr ')),
                redevelopment: getText(content.querySelector('.is24qa-modernisierung-sanierung')),
                condition: getText(content.querySelector('.is24qa-objektzustand')),
                appointmentGrade: getText(content.querySelector('.is24qa-qualitaet-der-ausstattung')),
                heatingType: getText(content.querySelector('.is24qa-heizungsart')),
                energySource: getText(content.querySelector('.is24qa-wesentliche-energietraeger')),
                energyDemand: getText(content.querySelector('.is24qa-endenergiebedarf')),
            };
        });
        console.log(result);

        if (!app.connectionEstablished)
            return;

        app.con.query('INSERT INTO details SET ?', result, (err, res) => {
          if(err) throw err;

          console.log('Last insert ID:', res.insertId);
        });
        // await fs.appendFile('data.csv', `${result.price};${result.rooms};${result.space}\n`);
    }
}

module.exports = app;