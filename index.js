const pm = new (require('playmusic'))();
const fs = require('fs');
const id3 = require('node-id3');
const request = require('request');

const credentials = require('./credentials');
const logs = require('./logs');

const writeTagsToFile = (item, image) => new Promise((resolve, reject) => {
    logs.logWritingTags();

    const {
        artist, title,
        album, albumArtist,
        genre, year,
        trackNumber,
    } = item;

    const tags = {
        artist, title,
        album, albumArtist,
        genre, year,
        trackNumber,
    };

    if(image) tags.image = image;
    
    id3.write(tags, logs.fileName(item), (err) => {
        if(err) return reject(err);

        // remove this if you don't want to save your logs as file
        logs.saveLogs(item, image);

        return resolve(true);
    })     
}); 


const fetchImage = url => 
    new Promise((resolve, reject) =>  
        request(url, (err, res, body) => {
            if(err) return reject(err);
            if(!res) return resolve(null);
            
            const type = res.headers['content-type'].split('/');

            return resolve({
                mime: type[type.length - 1],
                imageBuffer: body
            });
        })
    );

const downloadSong = (item) => new Promise((resolve, reject) => {
    pm.getStream(item.id, (err, pmStream) => {
        if (err) reject(err);
        
        const filename = logs.fileName(item);

        logs.logDownloadIsStarting();

        const ws = new fs.WriteStream(filename);

        pmStream.pipe(ws);

        ws.on('finish', () => {
            ws.close(() => {
                logs.logDownloadFinished();

                return resolve(true);
            })
        })
    });
});


// remove this if you don't want to save your logs as file
logs.initLogs();

pm.init({
    email: credentials.email,
    password: credentials.password
}, (err) => {
    if(err) console.error(err);

    // change limit if you have download more/less songs
    pm.getAllTracks({ limit: 2000 }, async (err, { data: { items } }) => {
        if (err) console.error(err);

        logs.setAllCount(items.length);

        const downloadFuncs = items.map(item => () => {
            logs.logItem(item);

            return downloadSong(item)
                .then(() => {
                    if(item.albumArtRef && item.albumArtRef.length) {
                        logs.logImgIsDownloading();
                        return fetchImage(item.albumArtRef[0].url);
                    }
                    return null;
                })
                .then(image => writeTagsToFile(item, image))
                .then(() => logs.logCompleteFile())
                .catch(err => console.error(err));
        });

        for (const f of downloadFuncs) {            
            await f();
        }
    })
})
