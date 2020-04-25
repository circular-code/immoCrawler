const mysql = require('mysql');

const con = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'immodb',
  insecureAuth : true
});

con.connect((err) => {
  if(err){
    console.log('Error connecting to Db', err);
    return;
  }
  console.log('Connection established');

// create
//   const testInsert = { id: 114105248, rooms: 3, coldRent: 700.54, space: 70, zip: 78549, features: 'Balkon|Einbauküche', type: 'Maisonette' };
//   con.query('INSERT INTO details SET ?', testInsert, (err, res) => {
//     if(err) throw err;
  
//     console.log('Last insert ID:', res.insertId);
//   });


// update
// con.query(
//     'UPDATE authors SET city = ? Where ID = ?',
//     ['Leipzig', 3],
//     (err, result) => {
//       if (err) throw err;
  
//       console.log(`Changed ${result.changedRows} row(s)`);
//     }
//   );


// delete
// con.query(
//     'DELETE FROM authors WHERE id = ?', [5], (err, result) => {
//       if (err) throw err;
  
//       console.log(`Deleted ${result.affectedRows} row(s)`);
//     }
//   );


  con.query('SELECT * FROM details', (err,rows) => {
    if(err) throw err;
  
    console.log('Data received from Db:');
    console.log(rows);
  });
});

// end connection
// con.end((err) => {});