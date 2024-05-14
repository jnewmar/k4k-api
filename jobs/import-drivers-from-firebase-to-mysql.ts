import { createConnection, Connection } from 'mysql';
import { initializeApp, credential, database }  from 'firebase-admin'
import { ConfigService } from '../src/config/config.service';

class ImportDriversFromFirebaseToMysql {
  private configService = new ConfigService();
  private mysqlConnection: Connection;
  private serviceAccount: any;
  private fbDatabaseURL: string = 'https://kar4kids-1559332905364.firebaseio.com';

  constructor() {
    console.log('Iniciando...');
    this.loadConfig();
    this.initializeFirebaseApp();
    this.connectMysql();
  }

  private loadConfig(): void {
    console.log('Carregando dados para conexão...');
    this.mysqlConnection = createConnection({
     host: this.configService.get('MYSQL_HOST'),
     port: parseInt(this.configService.get('MYSQL_PORT')),
     user: this.configService.get('MYSQL_USERNAME'),
     password: this.configService.get('MYSQL_PASSWORD'),
     database: this.configService.get('MYSQL_DATABASE')
    });

    this.serviceAccount = {
      type: this.configService.get('FB_type'),
      project_id: this.configService.get('FB_project_id'),
      private_key_id: this.configService.get('FB_private_key_id'),
      private_key: this.configService.get('FB_private_key').replace(/\\n/g, '\n'),
      client_email: this.configService.get('FB_client_email'),
      client_id: this.configService.get('FB_client_id'),
      auth_uri: this.configService.get('FB_auth_uri'),
      token_uri: this.configService.get('FB_token_uri'),
      auth_provider_x509_cert_url: this.configService.get('FB_auth_provider_x509_cert_url'),
      client_x509_cert_url: this.configService.get('FB_client_x509_cert_url')
    }
  }

  private initializeFirebaseApp(): void {
    console.log('Inicializando Firebase...');
    initializeApp({credential: credential.cert(this.serviceAccount), databaseURL: this.fbDatabaseURL});
    console.log('Conectado!');
  }

  public getDriversFromFirebase(): Promise <database.DataSnapshot> {
    return database().ref('/Users/').orderByChild('private/userType')
    .equalTo("driver").once('value');
  }

  private connectMysql(): Promise<any> {
    console.log('Conectando ao MySQL...');
     return new Promise((resolve, reject) => {
       this.mysqlConnection.connect((err) => {
         if(err) return reject(err);
         console.log('Conectado!');
         resolve();
       })
     });
  }

  public execQuery(queryString: string, values?:any): Promise<any> {
    console.log('Executando query...')
    return new Promise((resolve, reject) => {
      const callback = (error, result, fields) => {
        if(error) return reject(error);
        resolve({result, fields});
      };

      if(values)
        this.mysqlConnection.query(queryString, [values], callback);
      else
        this.mysqlConnection.query(queryString, callback);
    });
  }

  public resolveDrivers(drivers: database.DataSnapshot): Array<any> {
    const driversJSON = drivers.toJSON();
    const driversToImport = new Array<any>();

    for(let key in driversJSON) {

      const driver = driversJSON[key];
      
      if((driver.private.userStatus === 'active') && (driver.private.userType === 'driver')){
        const driverToImport = [
          key, 
          driver.private.name.trim().toLowerCase(),
          driver.private.city.trim().toLowerCase(),
          (driver.private.equipments.carSeat)?1:0,
          (driver.private.equipments.liftSeat)?1:0,
          (driver.private.userTest)?1:0
        ];
        driversToImport.push(driverToImport);
      }
    }
    console.log(`Drivers para importar - ${driversToImport.length}`);
    return driversToImport;
  }
}
 

function main(): void {
  const job = new ImportDriversFromFirebaseToMysql();

  const createTableQuery = "CREATE TABLE IF NOT EXISTS k4k.available_drivers_tmp (" +
    "id char(35) NOT NULL," +
    "name varchar(50) DEFAULT NULL," +
    "city varchar(45) NOT NULL," +
    "car_seat tinyint(4) NOT NULL DEFAULT '0'," +
    "lift_seat tinyint(4) NOT NULL DEFAULT '0'," +
    "test tinyint(4) NOT NULL DEFAULT '0'," +
    "PRIMARY KEY (id)," +
    "KEY ndx1 (city,car_seat,lift_seat)" +
  ") ENGINE=InnoDB DEFAULT CHARSET=latin1;";

  const insertDriversTempQuery = "INSERT INTO k4k.available_drivers_tmp  (id, name, city, car_seat, lift_seat, test) VALUES ?";
  
  const renameTableToOldDriversQuery = "ALTER TABLE k4k.available_drivers RENAME TO k4k.available_drivers_old";

  const renameTableToAvailableDriversQuery = "ALTER TABLE k4k.available_drivers_tmp RENAME TO k4k.available_drivers";

  const dropTableDriversOlsQuery = "DROP TABLE k4k.available_drivers_old";

  job.execQuery(createTableQuery)
  .then(() => job.getDriversFromFirebase())
  .then((drivers: database.DataSnapshot) => job.resolveDrivers(drivers))
  .then((drivers: Array<any>) => job.execQuery(insertDriversTempQuery, drivers))
  .then(() => job.execQuery(renameTableToOldDriversQuery))
  .then(() => job.execQuery(renameTableToAvailableDriversQuery))
  .then(() => job.execQuery(dropTableDriversOlsQuery))
  .then(() => {
    console.log('Terminado com sucesso!');
    process.exit(0);
  })
  .catch((err: any) => {
    console.log('Erro no Job...', err);
    process.exit(-1);
  })
}

main();