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
  /**
   * Update modal opened with text contents
   * @param {string} viewId ID of view opened
   * @param {string} url URL string
   */
  async function updateModal({ viewId, token, url }) {
    if (!url) {
      return;
    }

    const contents = await parseUrl(url);

    const blocks = (() => {
      if (contents.failed) {
        return {
          title: {
            type: "plain_text",
            text: "Loading failed",
          },
          close: {
            type: "plain_text",
            text: "Close",
          },
          blocks: [
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text: `We could not load from URL ☹️`,
                emoji: true,
              },
            },
          ],
        };
      }
      return {
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
              : null),
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
      };
    })();

    await client.views.update({
      token: context.botToken,
      view_id: viewId,
      view: {
        type: "modal",
        callback_id: "quick_read_modal",
        ...blocks,
      },
    });
  }

  try {
    await ack();

    const message = shortcut.message;
    const url = getUrlToParse(message.text);

    let loadingText = `Firing up a Browser... 🚀`;

    if (!url) {
      loadingText = `No URL found in message 😟`;
    }

    const openResult = await client.views.open({
      token: context.botToken,
      trigger_id: shortcut.trigger_id,
      view: {
        type: "modal",
        callback_id: "quick_read_modal",
        title: {
          type: "plain_text",
          text: `Loading ...`,
        },
        close: {
          type: "plain_text",
          text: "Close",
        },
        blocks: [
          {
            type: "section",
            text: {
              type: "plain_text",
              text: loadingText,
              emoji: true,
            },
          },
        ],
      },
    });

    updateModal(openResult.view.id, url);
  } catch (err) {
    console.error(err);
  }
}

module.exports = readShortcut;
