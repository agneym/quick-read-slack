require("dotenv").config();

const express = require("express");
const { App } = require("@slack/bolt");
const jwt = require("jsonwebtoken");

const createDatabase = require("./database");
const createHandlers = require("./handler");

const db = createDatabase();

const scopes = ["chat:write", "commands", "files:write"];
const app = new App({
  clientId: process.env.SLACK_CLIENT_ID,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  clientSecret: process.env.SLACK_CLIENT_SECRET,
  stateSecret: process.env.STATE_SECRET,
  authVersion: "v2",
  scopes,
  installationStore: {
    storeInstallation: (installation) => {
      console.log("asked to store information");
      return db.set(installation.team.id, installation);
    },
    fetchInstallation: (InstallQuery) => {
      console.log("asked to fetch information");
      return db.get(InstallQuery.teamId);
    },
  },
});

createHandlers(app);

const expressApp = app.receiver.app;
expressApp.set("view engine", "ejs");
expressApp.use(express.static("views"));

expressApp.get("/", (req, res) => {
  res.render("index", {
    stateToken: jwt.sign(
      { installOptions: { scopes } },
      process.env.STATE_SECRET
    ),
  });
});

(async () => {
  await app.start(process.env.PORT || 3000);
  console.log("⚡️ Bolt app is running!");
})();
