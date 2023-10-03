const sqlite3 = require("sqlite3").verbose();
const filepath = "./data.db";
const db = createDbConnection();
//insertTest('bob','Test1234');
listUsers();
function createDbConnection(next) {
  const db = new sqlite3.Database(filepath, (error) => {
    if (error) {
      return console.error(error.message);
    }
    
  });
  console.log("Connection with SQLite has been established");

  return db;
}
function createTable()
{
  try {
    const create = "CREATE TABLE users (id INTEGER PRIMARY KEY AUTOINCREMENT, username VARCHAR(50), password VARCHAR(50), role_id INT, status INT)";
    console.log(create);
    db.exec(create);
    console.log("Table created");
  } catch (ex) {
    console.log("error:", ex);
  }
}
function insertTest(un, pw)
{
  try {
    const insert = `INSERT INTO users (username,password,role_id, status) VALUES('${un}','${pw}', 1,1);`;
    db.exec(insert);
    console.log("user created.");
  } catch (ex) {
    console.log("error:", ex);
  }
}
function listUsers()
{
  try {
    db.each(`SELECT * FROM users`, (error, row) => {
      if (error) {
        throw new Error(error.message);
      }
      console.log(row);
    });
   } catch (ex) {
    console.log("error:", ex);
  } 
}