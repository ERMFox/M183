require('dotenv').config()

module.exports = {
    host: process.env.host,
    user: process.env.user,
    password: process.env.password,
    database: process.env.database,
    secret: process.env.secret,
    sessionSecret: process.env.sessionSecret
};

//test
