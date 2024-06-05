const fs = require ('fs')
const path = require('path');
const logFilePath = path.join(__dirname, '../logs/logs.txt');


const log = (actionPerformed, uuid, sourceIp, location, error, systemComponent) => {
    const timestamp = new Date().toISOString();
    const logEntry =
     `[${timestamp}] :
     \n [${actionPerformed}], 
     \n by: [${uuid}],
     \n from IP: [${sourceIp}],
     \n location: [${location}],
     \n error: [${error || 'none'}],
     \n system: [${systemComponent}]\n`;

    fs.appendFile(logFilePath, logEntry, (err) => {
        if (err) {
            console.error('Failed to write to log file', err);
        }
    });
};

module.exports = {
    log
};