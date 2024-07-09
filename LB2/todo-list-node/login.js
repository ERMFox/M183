const db = require("./fw/db");
const bcrypt = require("bcrypt");
const speakeasy = require("speakeasy");
const qrcode = require('qrcode');
const crypto = require('crypto');

const saltRounds = 10;

async function handleLogin(req, res) {
    let msg = "";
    let user = { username: "", userid: 0 };

    if (typeof req.body.username !== "undefined" && typeof req.body.password !== "undefined") {
        let result = await validateLogin(req.body.username, req.body.password);

        if (result.valid) {
            user.username = req.body.username;
            user.userid = result.userId;
            msg = result.msg;

            const dbConnection = await db.connectDB();
            const sql = `SELECT secret_key FROM users WHERE ID = ?`;
            const [results] = await dbConnection.query(sql, [user.userid]);

            if (results.length > 0 && results[0].secret_key !== "") {
                const secret = results[0].secret_key;
                const otpauthUrl = speakeasy.otpauthURL({
                    secret: secret,
                    label: "My App",
                    issuer: "My Company"
                });

                // Generate the QR code asynchronously
                try {
                    const qrCodeDataUrl = await qrcode.toDataURL(otpauthUrl);

                    const qrCode = `<img src="${qrCodeDataUrl}" alt="QR Code">`;
                    msg += `<p>Please scan the QR code and enter the 2FA code:</p>${qrCode}<form method="post" action="/verify2fa"><input type="text" name="twoFaCode" id="twoFaCode"><button type="submit">Verify</button></form>`;
                } catch (error) {
                    console.error("Error generating QR code:", error);
                }
            } else {
                startUserSession(res, user);
                return; // Exit function to prevent further processing
            }
        } else {
            msg = result.msg;
        }
    }

    if (!user.userid) {
        console.error('User ID is not set');
    }

    return { html: msg + getHtml(), user: user }; // Always return an object with html and user
}

async function validateLogin(username, password) {
    let msg = "";
    let userId = 0;
    let valid = false;

    const dbConnection = await db.connectDB();
    const sql = `SELECT ID, password FROM users WHERE username = ?`;
    const [results] = await dbConnection.query(sql, [username]);

    if (results.length > 0) {
        const storedPassword = results[0].password;

        if (storedPassword.length === 64) {
            // SHA-256 hash comparison
            const sha256Hash = crypto.createHash('sha256').update(password).digest('hex');
            if (sha256Hash === storedPassword) {
                // Rehash the password with bcrypt and update the stored password
                const hashedPassword = await bcrypt.hash(password, saltRounds);
                await dbConnection.query('UPDATE users SET password = ? WHERE ID = ?', [hashedPassword, results[0].ID]);
                userId = results[0].ID;
                valid = true;
                msg = "Login successful";
            }
        } else {
            // bcrypt hash comparison
            const isValidPassword = await bcrypt.compare(password, storedPassword);
            if (isValidPassword) {
                userId = results[0].ID;
                valid = true;
                msg = "Login successful";
            }
        }

        if (valid) {
            // Check if 2FA is not enabled for this user
            const sql2 = `SELECT secret_key FROM users WHERE ID = ?`;
            const [results2] = await dbConnection.query(sql2, [userId]);

            if (results2.length > 0 && !results2[0].secret_key) {
                // Generate a secret key for 2FA and store it in the database
                const secret = speakeasy.generateSecret();
                const sql3 = `UPDATE users SET secret_key = ? WHERE ID = ?`;
                await dbConnection.query(sql3, [secret.base32, userId]);
            }
        } else {
            msg = "Invalid Login Credentials";
        }
    } else {
        msg = "Invalid Login Credentials";
    }

    return { valid: valid, msg: msg, userId: userId };
}

async function verify2FA(req, res) {
    const userId = req.user.userid;
    const userTwoFaCode = req.body.twoFaCode;

    const dbConnection = await db.connectDB();
    const sql = `SELECT secret_key FROM users WHERE ID = ?`;
    const [results] = await dbConnection.query(sql, [userId]);

    if (results.length > 0) {
        const secret = results[0].secret_key;

        const verified = speakeasy.totp.verify({
            secret: secret,
            token: userTwoFaCode,
            encoding: "base32",
        });

        if (verified) {
            // 2FA code is valid, start the user session
            startUserSession(res, req.user);
        } else {
            // 2FA code is invalid, display an error message
            res.send("Invalid 2FA code");
        }
    } else {
        res.send("2FA is not enabled for this user");
    }
}

function startUserSession(res, user) {
    res.cookie("username", user.username);
    res.cookie("userid", user.userid);
    res.redirect("/");
}

function getHtml() {
    return `
    <h2>Login</h2>
    <form id="form" method="post" action="/login">
      <div class="form-group">
        <label for="username">Username</label>
        <input type="text" class="form-control size-medium" name="username" id="username">
      </div>
      <div class="form-group">
        <label for="password">Password</label>
        <input type="password" class="form-control size-medium" name="password" id="password">
      </div>
      <div class="form-group">
        <label for="submit"></label>
        <input id="submit" type="submit" class="btn size-auto" value="Login" />
      </div>
    </form>`;
}

module.exports = {
    handleLogin: handleLogin,
    startUserSession: startUserSession,
    verify2FA: verify2FA,
    getHtml: getHtml
};