require("dotenv").config();

const express = require("express");
const { App } = require("@slack/bolt");

const createDatabase = require("./database");
const createHandlers = require("./handler");

const db = createDatabase();

const app = new App({
  clientId: process.env.SLACK_CLIENT_ID,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  clientSecret: process.env.SLACK_CLIENT_SECRET,
  stateSecret: process.env.STATE_SECRET,
  scopes: ["chat:write", "commands", "files:write"],
  installationStore: {
    storeInstallation: (installation) => {
      return db.set(installation.team.id, installation);
    },
    fetchInstallation: (InstallQuery) => {
      return db.get(InstallQuery.teamId);
    },
  },
});

createHandlers(app);

const expressApp = app.receiver.app;
expressApp.use(express.static("public"));

(async () => {
  await app.start(process.env.PORT || 3000);
  console.log("⚡️ Bolt app is running!");
})();
