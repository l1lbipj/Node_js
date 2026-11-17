
const { OAuth2Client } = require("google-auth-library");

const googleClient = new OAuth2Client(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.GOOGLE_CALLBACK_URL
);

module.exports = googleClient;
