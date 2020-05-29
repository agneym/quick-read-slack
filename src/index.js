require("dotenv").config();

const { App } = require("@slack/bolt");

const createHandlers = require("./handler");

// Initializes your app with your bot token and signing secret
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  clientId: process.env.SLACK_CLIENT_ID,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
});

createHandlers(app);

(async () => {
  // Start your app
  await app.start(process.env.PORT || 3000);

  console.log("⚡️ Bolt app is running!");
})();
