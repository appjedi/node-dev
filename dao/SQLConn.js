const { Sequelize, DataTypes, QueryTypes } = require("Sequelize");

let sequelize;

let connection;
class SQLConn {
  constructor(connObj) {
    connection = connObj;
    this.init();
  }
  init = () => {
    sequelize = new Sequelize(connection);
    sequelize
      .authenticate()
      .then(() => {
        console.log("database connected");
      })
      .catch((error) => {
        console.error("Unable to connect: ", error);
      });
  };
  query = async (query, values) => {
    const results = await sequelize.query(query, {
      replacements: values,
      type: QueryTypes.SELECT,
    });
   // console.log(results);
    return results;
  };
  execute = async (query, values) => {
    const results = await sequelize.query(query, {
      replacements: values,
    });
    return results;
  };
}

//export default SQLConn;

process.env.USER, process.env.PASSWORD;

const conn = {
  user: "",
  password: "",
  host: "0.0.0.0",
  dialect: "sqlite",
  pool: {
    max: 5,
    min: 0,
    idle: 10000,
  },
  // Data is stored in the file `database.sqlite` in the folder `db`.
  // Note that if you leave your app public, this database file will be copied if
  // someone forks your app. So don't use it to store sensitive information.
  storage: "./data.db",
};

async function main()
{
  const db = new SQLConn(conn);
  const rows = await db.query("SELECT * FROM users");
  console.log(rows);
}
main();