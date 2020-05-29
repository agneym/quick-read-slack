const readShortcut = require("./readShortcut");

function createHandlers(app) {
  app.shortcut("quick_read", readShortcut);
}

module.exports = createHandlers;
