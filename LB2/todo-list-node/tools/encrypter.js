const crypto = require('crypto');
const config = require('../config')
const secret = config.secret
// Function to sign a cookie value
function signCookie(value) {
    const hmac = crypto.createHmac('sha256', secret);
    const stringValue = value.toString();
    hmac.update(stringValue);
    const signature = hmac.digest('hex');
    return `${stringValue}.${signature}`;
  }

  function verifyCookie(signedValue) {
    const [value, signature] = signedValue.split('.');
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(value);
    const validSignature = hmac.digest('hex');
    return validSignature === signature ? value : null;
  }

  function returnCookieValue(cookie){
    const [value, signature] = cookie.split('.');
    return value
  }

  function returnCookieValueAsInt(cookie){
    const [value, signature] = cookie.split('.');
    return parseInt(value)
  }
module.exports = {
    signCookie,
    verifyCookie,
    returnCookieValue,
    returnCookieValueAsInt
}