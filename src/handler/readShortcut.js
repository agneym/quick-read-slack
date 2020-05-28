const getUrls = require("get-urls");
const Parser = require("@postlight/mercury-parser");

/**
 * Get URL from text and determine first URL
 * @param {string} message
 */
function getUrlToParse(message) {
  const sanitiseMessage = message.replace(">", "");
  const urls = getUrls(sanitiseMessage);

  // We are choosing to get first URL here:
  const firstUrl = [...urls][0];

  return firstUrl;
}

/**
 * Title field allows for only 25 characters at most
 * @param {string} title full title of page
 */
function formatTitle(title) {
  const length = title.length;
  if (length >= 25) {
    return `${title.slice(0, 20)}...`;
  }
  return title;
}

/**
 * Parse markdown data from given URL
 * @param {string} url
 */
async function parseUrl(url) {
  try {
    const response = await Parser.parse(url, { contentType: "markdown" });
    return response;
  } catch (err) {
    console.error(error);
  }
}

async function readShortcut({ shortcut, ack, context, client }) {
  try {
    await ack();

    const message = shortcut.message;
    const url = getUrlToParse(message.text);

    if (!url) {
      await client.chat.postMessage({
        token: context.botToken,
        text: "Sorry, we could not retrieve the URL from your message",
        icon_emoji: ":crying_cat_face:",
        thread_ts: shortcut.message_ts,
        channel: shortcut.channel.id,
      });
      return;
    }

    const contents = await parseUrl(url);

    await client.files.upload({
      token: context.botToken,
      filetype: "post",
      content: contents.content,
      title: contents.title,
      channels: shortcut.channel.id,
      initial_comment: `Here's the summary you asked for`,
      thread_ts: shortcut.message_ts,
    });
  } catch (err) {
    console.error(err);
  }
}

module.exports = readShortcut;
