import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

export const AppDataSource = new DataSource({
    type: 'mssql',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '1433', 10),
    username: process.env.DB_USER || 'sa',
    password: process.env.DB_PASSWORD || 'YourStrong!Passw0rd',
    database: process.env.DB_NAME || 'NeuraVoting',
    synchronize: false, // We use the existing SQL script schema
    logging: true,
    entities: [
        __dirname + '/../models/*.{js,ts}',
    ],
    options: {
        encrypt: true, 
        trustServerCertificate: true // True for local dev with self-signed certs
    }
});
