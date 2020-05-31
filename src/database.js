const faunadb = require("faunadb");

const q = faunadb.query;

const COLLECTION_NAME = "users";
const INDEX_NAME = "install_by_key";

function createIndex() {
  try {
    client.query(
      q.CreateIndex({
        name: INDEX_NAME,
        source: q.Collection(COLLECTION_NAME),
        terms: [{ field: ["data", "key"] }],
      })
    );
  } catch (err) {
    // ignore
  }
}

function createDatabase() {
  const client = new faunadb.Client({ secret: process.env.FAUNADB_API_KEY });
  createIndex();

  const get = async (key) => {
    try {
      const res = await client.query(q.Get(q.Match(q.Index(INDEX_NAME), key)));
      return res.data.value;
    } catch (err) {
      console.error(err);
      return null;
    }
  };

  const set = (key, value) => {
    return client.query(
      q.Create(q.Collection(COLLECTION_NAME), {
        data: {
          key,
          value,
        },
      })
    );
  };

  return {
    get,
    set,
  };
}

module.exports = createDatabase;
