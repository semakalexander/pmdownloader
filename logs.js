const fs = require('fs');

let allCount = 0;
let currentCount = 0;

const setAllCount = val => allCount = val; 

const fileName = item => 
    `./songs/${item.artist.replace('/', '|')} - ${item.title.replace('/', '|')}`;

const logItem = item => console.log(fileName(item) + '\n');

const logWritingTags = () => 
    console.log(`Writing tags...`);

const logDownloadIsStarting = () => 
    console.log(`Downloading song...`);

const logDownloadFinished = () => 
    console.log(`Download song is finished.`);

const logCompleteFile = () => 
    console.log(`${'-'.repeat(50)} ${++currentCount}/${allCount}\n\n\n`) ;

const logImgIsDownloading = () => 
    console.log(`Downloading image...`);

const saveLogs = (item, image) => {
    const filename = fileName(item) + '\n';

    fs.appendFileSync('logs/all.csv', filename);
    
    if(image) 
        fs.appendFileSync('logs/withImg.csv', filename);
    else 
        fs.appendFileSync('logs/noImg.csv', filename);
}

const initLogs = () => {
    fs.writeFileSync('logs/all.csv', 'filename\n');
    fs.writeFileSync('logs/withImg.csv', 'filename\n');
    fs.writeFileSync('logs/noImg.csv', 'filename\n');
};

module.exports = {
    allCount,
    currentCount,
    setAllCount,
    fileName,
    logItem,
    logWritingTags,
    logDownloadIsStarting,
    logDownloadFinished,
    logImgIsDownloading,
    logCompleteFile,
    saveLogs,
    initLogs
}