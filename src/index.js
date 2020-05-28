require("dotenv").config();

const { App } = require("@slack/bolt");

const readShortcut = require("./handler/readShortcut");

// Initializes your app with your bot token and signing secret
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
});

app.shortcut("quick_read", readShortcut);

(async () => {
  // Start your app
  await app.start(process.env.PORT || 3000);

  console.log("⚡️ Bolt app is running!");
})();
