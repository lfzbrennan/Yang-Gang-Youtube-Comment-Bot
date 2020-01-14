const cheerio = require('cheerio')
const request = require('request')

let videosinfected = 0;


// posts comment on video using youtube api

async function sendRequest(videoID) {
    videosinfected+=1;
    console.log("Number of Videos Infected: " + videosinfected);
    new Promise((resolve, reject) => {
        request({
            method: 'POST',
            url: 'https://www.googleapis.com/youtube/v3/commentThreads',
            headers: {
                'User-Agent': 'Request-Promise'
            },
            body: {
                "snippet": {
                    "topLevelComment": {
                        "snippet": {
                            "videoId": videoID,
                            "textOriginal": "YANG GANG"
                        }
                    }
                }
            },
            qs: {
                part: 'snippet',
                access_token: "MY YOUTUBE API TOKEN"
            },
            json: true
        }, function (err, response, body) {
            if (err) {
                //console.log('body', body);
                //console.log('error in when posting comment ', err.stack);
            return reject(err);
            }
            return resolve(body);
        });
    });
}

// video infector

function videoInfector(videoID) {

    // posts comment on that video using youtube api

    sendRequest(videoID);
    video = "https://www.youtube.com/watch?v=" + videoID;

    request.get(search_query, (err, res, data) => {
        if (err) {
            //console.log(err.stack);
            return;
        }
        const $ = cheerio.load(data);

        let links = [];
        let titles = [];
        let classes = [];

        $('a').each( (index, value) => {
            let link = $(value).attr('href');
            links.push(link);

            let class_ = $(value).text();
            classes.push(class_);

            let title = $(value).attr('title');
            titles.push(title);
        });

        let triplets = [];

        for (let i = 0; i < links.length; i++) { 
            if (links[i].substring(0, 6) === "/watch" && titles[i]) {
                triplets.push({link: links[i].substring(9), title: titles[i], channel: classes[i+1]});
            }
        }

        for (let i = 0; i < triplets.length; i++) {
            if (triplets[i].title.toLowerCase().includes("yang") || triplets[i].channel.toLowerCase().includes("yang")) {
                videoInfector(triplets[i].link);
            }
        }
    })
}


// base infector
function baseInfector(query) {
    search_query = "https://www.youtube.com/results?search_query=" + query;

    request.get(search_query, (err, res, data) => { // gets request from specific search query
        const $ = cheerio.load(data);   // loads the query response

        let links = [];
        let titles = [];
        let classes = [];

        // parses all links, titles, and classes

        $('a').each( (index, value) => {
            let link = $(value).attr('href');
            links.push(link);

            let class_ = $(value).text();
            classes.push(class_);

            let title = $(value).attr('title');
            titles.push(title);
        });

        let triplets = [];

        // create json with all video links, video titles, and channel names

        for (let i = 0; i < links.length; i++) {
            if (links[i].substring(0, 6) === "/watch" && titles[i]) {
                triplets.push({link: links[i].substring(9), title: titles[i], channel: classes[i+1]});
            }
        }

        // recursively spreads to all videos with either "yang" in the video title or channel title

        for (let i = 0; i < triplets.length; i++) {
            if (triplets[i].title.toLowerCase().includes("yang") || triplets[i].channel.toLowerCase().includes("yang")) {
                videoInfector(triplets[i].link);
            }
        }
    })
}

// starts base with "andrew yang" search query

baseInfector("andrew+yang");
