const { Sequelize } = require("sequelize");
const connStr = "postgresql://devuser:Dev1234!@172.18.0.3:5432/dev_db";
const sequelize = new Sequelize(connStr)
const testDbConnection = async () => {
    try {
        await sequelize.authenticate();
        console.log("Connection has been established successfully.");
    } catch (error) {
        console.error("Unable to connect to the database:", error);
    }
};
testDbConnection();
const connObj = {
    host: '172.18.0.3',
    port: 5432,
    database: 'dev_db',
    user: 'postgres',
    password: 'root',
}
const test = async () => {
    const client = new Client(connObj);
    console.log("client");
    await client.connect();
    //const client = await pool.connect();
    console.log("connected");
    const res = await client.query("SELECT * FROM users");
    console.log(res);
}
