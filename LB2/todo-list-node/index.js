const tasklist = require('./user/tasklist');
const bgSearch = require('./user/backgroundsearch');
const encrypter = require('./tools/encrypter')
async function getHtml(req) {
    let taskListHtml = await tasklist.html(req);
    if(!encrypter.verifyCookie(req.cookies.username)){
        return
    }
    var username = encrypter.returnCookieValue(req.cookies.username)
    return `<h2>Welcome, `+username+`!</h2>` + taskListHtml + '<hr />' + bgSearch.html(req);
}

module.exports = {
    html: getHtml
}