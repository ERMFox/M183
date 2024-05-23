const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const readline = require('readline');

// Function to generate a new secret key
function generateSecret() {
  const secret = speakeasy.generateSecret({ length: 20 });
  return secret;
}

// Function to display a QR code for the user to scan
function displayQRCode(secret) {
  qrcode.toString(secret.otpauth_url, { type: 'terminal' }, (err, qrcode) => {
    if (err) throw err;
    console.log('Scan this QR code with your authenticator app:');
    console.log(qrcode);
  });
}

// Function to verify the TOTP code entered by the user
function verifyTOTPCode(secret, code) {
  const verified = speakeasy.totp.verify({
    secret: secret.base32,
    encoding: 'base32',
    token: code
  });

  return verified;
}

// Function to prompt the user for the TOTP code
function promptForTOTPCode(secret, callback) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.question('Enter the TOTP code: ', (code) => {
    const verified = verifyTOTPCode(secret, code);
    callback(verified);
    rl.close();
  });
}

module.exports = {
  generateSecret,
  displayQRCode,
  verifyTOTPCode,
  promptForTOTPCode
};
