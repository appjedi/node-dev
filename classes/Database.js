const MySql = require('sync-mysql');
const GC_CONNECTIONS = [{
  host: 'localhost',
  user: 'root',
  database: 'test',
  password: ''
},
{
  host: 'appdojo.net',
  user: 'appjedin_sensei',
  database: 'appjedin_training',
  password: 'Sensei2022!'
}, {
  host: "192.168.64.2", // Mac
  user: "training",
  password: "Test1234",
  database: "test",
  port: 3306
}
];
const GC_CONN_IDX = 1;
module.exports= class Database   {
    conn=null;
    constructor(){
        this.conn=new MySql(GC_CONNECTIONS[GC_CONN_IDX]);
    }

    getConn() {
        if (!this.conn)
        {
            this.conn=new MySql(GC_CONNECTIONS[GC_CONN_IDX]);
        }
        return this.conn;
    }
    query (query, args) {
        const cn =this.getConn()
        if (args)
        {
            return cn.query(query, args);
        } else {
            return cn.query(query);
        }
    }
    
}
