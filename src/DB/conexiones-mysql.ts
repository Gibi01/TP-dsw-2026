import { connect } from 'http2';
import mysql from 'mysql2/promise';

//la configuracion que tiene la conexion a la base de datos más el guapo usuario con el que se ingresa
export const pool = mysql.createPool({
  host: '127.0.0.1',
  user: 'dsw',
  password: '1234',
  database: 'usuarios',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true, //evita que de timeout desde el lado del servidor por inactividad
  keepAliveInitialDelay: 0,
});
