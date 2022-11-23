/** Database setup for Biztime. */
const Pool = require("pg").Pool;

let DB;

if (process.env.NODE_ENV === "test") {
  DB = "biztime_test";
} else {
  DB = "biztime";
}
const DB_URI = `postgresql:///${DB}`;

const pool = new Pool({
  host: "localhost",
  database: DB,
  password: "admin",
});

module.exports = pool;
