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
    const code = err.data.error;
    if (code === "not_in_channel") {
      const {
        message: { user },
      } = shortcut;
      await client.chat.postMessage({
        token: context.botToken,
        text:
          "It seems like Quick Read is not part the channel you were trying. This is required for us to post a message to the channel. For instructions: https://slack.com/intl/en-in/help/articles/202035138-Add-an-app-to-your-workspace",
        icon_emoji: ":crying_cat_face:",
        channel: user,
        as_user: true,
      });
      return;
    }
    console.error(err);
  }
}

module.exports = readShortcut;
