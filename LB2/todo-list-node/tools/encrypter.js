const crypto = require('crypto');

// Function to sign a cookie value
function signCookie(value, secret) {
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(value);
    const signature = hmac.digest('hex');
    return `${value}.${signature}`;
  }

  function verifyCookie(signedValue, secret) {
    const [value, signature] = signedValue.split('.');
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(value);
    const validSignature = hmac.digest('hex');
    return validSignature === signature ? value : null;
  }
