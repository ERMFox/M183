const fs = require('fs');
const path = require('path');

const logFilePath = path.join(__dirname, 'logs.txt');

const log = (actionPerformed, uuid, sourceIp, location, error, systemComponent) => {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] [${actionPerformed}] by [${uuid}] from IP: [${sourceIp}], location: [${location}], error: [${error || 'none'}], system: [${systemComponent}]\n`;

    fs.appendFile(logFilePath, logEntry, (err) => {
        if (err) {
            console.error('Failed to write to log file', err);
        }
    });
};

module.exports = {
    log
};