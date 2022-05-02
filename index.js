const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const request = require('request');

const url = "https://www.uiu.ac.bd/faculty-members/";

const download = async (uri, filename, callback) => {
  request.head(uri, function(err, res, body){    
    request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
  });
};

const scraping = async (URL) => {
    const { data } = await axios.get(URL);
    const $ = cheerio.load(data);

    const links = [];
    const srcs = [];

    $('.tab-pane table tbody tr td a').each((index, value) => {
        let link = $(value).attr('href');
        let text = $(value).text();

        let name = text.split(" ");
        
        links.push([link, name[name.length - 1]]);
    });

    links.forEach(async link => {
        try {
            const { data } = await axios.get(link[0]);
            const $$ = cheerio.load(data);
            $$('.wp-post-image').each(async (index, value) => {
                const src = $$(value).attr('src');
                srcs.push(src);
                await download(src, `./images/${link[1]}-${Math.floor(Math.random() * 50)}.jpg`, () => {
                    console.log(`Done ${link[1]}`);
                })
            });
            
        } catch (error) {}
    });
}

scraping(url);