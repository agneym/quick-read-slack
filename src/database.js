const faunadb = require("faunadb");

const q = faunadb.query;

const COLLECTION_NAME = "users";

function createDatabase() {
  const client = new faunadb.Client({ secret: process.env.FAUNADB_API_KEY });

  const get = async (key) => {
    const res = client.query(q.Get(q.Ref(q.Collection(COLLECTION_NAME), key)));
    return res.data;
  };

  const set = (key, value) => {
    return client.query(
      q.Create(q.Collection(COLLECTION_NAME), {
        data: {
          [key]: value,
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
