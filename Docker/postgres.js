var pg = require('pg');

var client = new pg.Client('postgres://root:root@127.0.0.1:5432/test_db');
client.connect(function(err) {
  if (err) {
    throw err;
  }

  var ids = [23, 65, 73, 99, 102];
  client.query(
    'SELECT * FROM users',
      // array of query arguments
    function(err, result) {
      console.log(result.rows);
    }
  );
});