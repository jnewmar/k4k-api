const mysql = require('mysql');
const admin = require("firebase-admin");
const dotenv = require('dotenv');
const fs = require('fs');
 
var filePath = '.env.';
if (process.env.NODE_ENV == undefined) {
    filePath += 'development'
} else {
    filePath = filePath + process.env.NODE_ENV;
}

var envConfig = dotenv.parse(fs.readFileSync(filePath))
//console.log(envConfig);


const mysqlConnection = mysql.createConnection({
  host     : envConfig['MYSQL_HOST'],
  port     : envConfig['MYSQL_PORT'],
  user     : envConfig['MYSQL_USERNAME'],
  password : envConfig['MYSQL_PASSWORD'],
  database : envConfig['MYSQL_DATABASE'],
});

const serviceAccount= {
  "type": envConfig['FB_type'],
  "project_id": envConfig['FB_project_id'],
  "private_key_id": envConfig['FB_private_key_id'],
  "private_key": envConfig['FB_private_key'].replace(/\\n/g, '\n'),
  "client_email": envConfig['FB_client_email'],
  "client_id": envConfig['FB_client_id'],
  "auth_uri": envConfig['FB_auth_uri'],
  "token_uri": envConfig['FB_token_uri'],
  "auth_provider_x509_cert_url": envConfig['FB_auth_provider_x509_cert_url'],
  "client_x509_cert_url": envConfig['FB_client_x509_cert_url']
};

admin.initializeApp(
  {
      credential: admin.credential.cert(serviceAccount),
      databaseURL: "https://kar4kids-1559332905364.firebaseio.com"
  }
);

mysqlConnection.connect(function(err){
  if(err) return console.log(err);
  console.log('Conecting firebase');
})

function createTableTmp(conn){
  console.log("Creating Tables ...");
  const sql = "CREATE TABLE k4k.available_drivers_tmp (" +
    "id char(35) NOT NULL," +
    "name varchar(50) DEFAULT NULL," +
    "city varchar(45) NOT NULL," +
    "car_seat tinyint(4) NOT NULL DEFAULT '0'," +
    "lift_seat tinyint(4) NOT NULL DEFAULT '0'," +
    "test tinyint(4) NOT NULL DEFAULT '0'," +
    "PRIMARY KEY (id)," +
    "KEY ndx1 (city,car_seat,lift_seat)" +
  ") ENGINE=InnoDB DEFAULT CHARSET=latin1;";
  
  conn.query(sql, function (error, results, fields){
      if(error) return console.log(error);
      console.log('criou a tabela!');
  });
}

function addDriversTmp(conn, values){
  console.log("Adding Drivers  ...");
  const sql = "INSERT INTO k4k.available_drivers_tmp  (id, name, city, car_seat, lift_seat, test) VALUES ?";
  conn.query(sql, [values], function (error, results, fields){
          if(error) return console.log(error);
          console.log('adicionou registros!');
          //conn.end();//fecha a conexão
      });
}


function renameTables(conn) {
  console.log("Renaming Tables ...");
  let sql1 = "ALTER TABLE k4k.available_drivers RENAME TO k4k.available_drivers_old";
  conn.query(sql1, function (error, results, fields){
    if(error) return console.log(error);
  });

  let sql2 = "ALTER TABLE k4k.available_drivers_tmp RENAME TO k4k.available_drivers";
  conn.query(sql2, function (error, results, fields){
    if(error) return console.log(error);
  });

  let sql3 = "DROP TABLE k4k.available_drivers_old";
  conn.query(sql3, function (error, results, fields){
    if(error) return console.log(error);
  });
}

function getDrivers() {
  const db = admin.database();
  let ref = db.ref('/Users/').orderByChild('private/userType').equalTo("driver");
  let res =  ref.once("value");
  return res;
}

const driversInfo = getDrivers()
 .then(function(valor) {
  //SUCESSO
  let drivers = valor.toJSON();
  let driversToImport = [];
  for (var key in drivers) {
    //console.log(key);
    let driver = drivers[key];
    if (
      driver['private']['userStatus'] == 'active' &&
      driver['private']['userType'] == 'driver'
    ) {
      let driverToImport = [
        key,
        driver['private']['name'].trim().toLowerCase(),
        driver['private']['city'].trim().toLowerCase(),
        (driver['private']['equipments']['carSeat'])?1:0,
        (driver['private']['equipments']['liftSeat'])?1:0,
        (driver['private']['userTest'])?1:0
      ];
      driversToImport.push(driverToImport);
    }
  }
  console.log("Importing "+ driversToImport.length +" drivers...");
  createTableTmp(mysqlConnection);
  addDriversTmp(mysqlConnection,driversToImport);
  renameTables(mysqlConnection);
  process.exit(0);
 }, function(err) {
    // rejeitada
    console.log(err);
    process.exit(-1);
});
 