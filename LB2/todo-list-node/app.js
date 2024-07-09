const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const path = require('path');
const header = require('./fw/header');
const footer = require('./fw/footer');
const login = require('./login');
const index = require('./index');
const adminUser = require('./admin/users');
const editTask = require('./edit');
const saveTask = require('./savetask');
const search = require('./search');
const searchProvider = require('./search/v2/index');
const logs = require('./tools/log_helper')
const dbFunctions = require("./tools/dbfunctions")
const encrypter = require("./tools/encrypter")
const app = express();
const PORT = 3000;

var bruteforceprotection = {}

// Middleware für Session-Handling
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));

// Middleware für Body-Parser
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());

// Routen
app.get('/', async (req, res) => {
    if(!encrypter.verifyCookie(req.cookies.userid) && ! encrypter.verifyCookie(req.cookies.username)){
        res.redirect("/lockout")
        return
    }
    performLogging("/", req)
    if (activeUserSession(req)) {
        let html = await wrapContent(await index.html(req), req)
        res.send(html);
    } else {
        res.redirect('login');
    }
});

app.post('/', async (req, res) => {
    performLogging("/, post", req)
    if(!encrypter.verifyCookie(req.cookies.userid) && ! encrypter.verifyCookie(req.cookies.username)){
        res.redirect("/lockout")
        return
    }
    if (activeUserSession(req)) {
        let html = await wrapContent(await index.html(req), req)
        res.send(html);
    } else {
        res.redirect('login');
    }
})

// edit task
app.get('/admin/users', async (req, res) => {
    performLogging("/admin/users", req)
    if (!encrypter.verifyCookie(req.cookies.userid)){
        res.redirect("/lockout")
        return
    }
    var userID = encrypter.returnCookieValueAsInt(req.cookies.userid)
    if(await dbFunctions.checkUserPermissions(userID) === "Admin") {
        let html = await wrapContent(await adminUser.html, req);
        res.send(html);
    } else {
        res.redirect('/');
    }
});

// edit task
app.get('/edit', async (req, res) => {
    performLogging("/edit", req)
    if(!encrypter.verifyCookie(req.cookies.userid) && ! encrypter.verifyCookie(req.cookies.username)){
        res.redirect("/lockout")
        return
    }
    if (activeUserSession(req)) {
        let html = await wrapContent(await editTask.html(req), req);
        res.send(html);
    } else {
        res.redirect('/');
    }
});

// remove task

app.get('/delete', async (req, res) =>{
    performLogging("/delete", req)
    const taskID = req.query.id
    if (!encrypter.verifyCookie(req.cookies.userid)){
        res.redirect("/lockout")
        return
    }
    const userID = encrypter.returnCookieValueAsInt(req.cookies.userid)
    if (await dbFunctions.compareUserAndTaskID(taskID, userID)){
        dbFunctions.deleteTask(taskID);
    }
    res.redirect("/")
})

// Login-Seite anzeigen


app.get('/login', async (req, res) => {
    performLogging("/login", req);
    const html = await wrapContent(login.getHtml(), req);
    res.send(html);
});
app.get('/lockout', (req, res) =>{
    res.send('Locked for 5 minutes')
})
app.post('/login', async (req, res) => {
    performLogging("/login", req);
    const locked = await dbFunctions.checkLockedUser(req.ip)
    if (locked){
        res.redirect('/lockout')
        return
    }
    let content;
    try {
        content = await login.handleLogin(req, res);
        if(content.user.username === ''){
            await dbFunctions.lockUser(req.ip)
        }
    } catch (error) {
        console.error("Error in handleLogin:", error);
        res.status(500).send("Internal Server Error");
        return;
    }
  
    if (content && content.user && content.user.userid !== 0) {
        // login was successful... set cookies and redirect to /
        login.startUserSession(res, content.user);
    } else {
        // login unsuccessful or not made yet... display login form
        const html = await wrapContent(content.html, req);
        res.send(html);
    }
});
// Logout
app.get('/logout', (req, res) => {
    req.session.destroy();
    res.cookie('username','');
    res.cookie('userid','');
    res.redirect('/login');
});

// Profilseite anzeigen
app.get('/profile', (req, res) => {
    performLogging("/profile", req)
    if(!encrypter.verifyCookie(req.cookies.userid) && ! encrypter.verifyCookie(req.cookies.username)){
        res.redirect("/lockout")
        return
    }
    if (req.session.loggedin) {
        res.send(`Welcome, ${req.session.username}! <a href="/logout">Logout</a>`);
    } else {
        res.send('Please login to view this page');
    }
});

// save task
app.post('/savetask', async (req, res) => {
    performLogging("/savetask, post", req)
    if(!encrypter.verifyCookie(req.cookies.userid) && ! encrypter.verifyCookie(req.cookies.username)){
        res.redirect("/lockout")
        return
    }
    if (activeUserSession(req)) {
        let html = await wrapContent(await saveTask.html(req), req);
        res.send(html);
    } else {
        res.redirect('/');
    }
});

// search
app.post('/search', async (req, res) => {
    if(!encrypter.verifyCookie(req.cookies.userid) && ! encrypter.verifyCookie(req.cookies.username)){
        res.redirect("/lockout")
        return
    }
    performLogging("/search, post", req)
    let html = await search.html(req);
    res.send(html);
});

// search provider
app.get('/search/v2/', async (req, res) => {
    if(!encrypter.verifyCookie(req.cookies.userid) && ! encrypter.verifyCookie(req.cookies.username)){
        res.redirect("/lockout")
        return
    }
    performLogging("/search/v2", req)
    let result = await searchProvider.search(req);
    res.send(result);
});


// Server starten
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

async function wrapContent(content, req) {
    let headerHtml = await header(req);
    return headerHtml+content+footer;
}

function performLogging(route, req){
    let userid = req.cookies.userid
    if (!req.cookies.userid){
        userid = null
    }else{
        userid = encrypter.returnCookieValueAsInt(userid)
    }
    
    logs.log("Accessed Rounte: " + route, userid, req.ip, req.headers['x-location'] || 'unknown', "", "Web-Interface")
    
}

function activeUserSession(req) {
    // check if cookie with user information ist set
    return req.cookies !== undefined && req.cookies.username !== undefined && req.cookies.username !== '';
}
