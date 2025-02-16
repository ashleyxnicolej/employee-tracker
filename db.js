import mysql from 'mysql2/promise';

const db = await mysql.createConnection({
    host: 'localhost',
    user: 'root',  // Change if needed
    password: 'your_password',  // Change if needed
    database: 'employee_db'
});

console.log('Connected to the database.');

export default db;
