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
    const response = await Parser.parse(url, { contentType: "text" });
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
      return;
    }

    const contents = await parseUrl(url);

    if (contents.failed) {
      return;
    }

    const result = await client.views.open({
      token: context.botToken,
      trigger_id: shortcut.trigger_id,
      view: {
        type: "modal",
        title: {
          type: "plain_text",
          text: formatTitle(contents.title),
        },
        close: {
          type: "plain_text",
          text: "Close",
        },
        blocks: [
          {
            ...(contents.title.length > 25
              ? {
                  type: "section",
                  text: {
                    type: "plain_text",
                    text: `*${contents.title}*`,
                  },
                }
              : {}),
          },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `*${contents.author}*`,
            },
          },
          {
            ...(contents.date_published
              ? {
                  type: "section",
                  text: {
                    type: "mrkdwn",
                    text: `_${contents.date_published}_`,
                  },
                }
              : {}),
          },
          {
            type: "context",
            elements: [
              {
                type: "mrkdwn",
                text: contents.content,
              },
            ],
          },
        ],
      },
    });

    console.log(result);
  } catch (err) {
    console.error(err);
  }
}

module.exports = readShortcut;
