
const mysql = require('mysql2/promise');
require('dotenv').config();

// Criação do pool de conexões
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'personal_trainer',
    waitForConnections: true,
    connectionLimit: 10,
    // Opcional: se precisar de timeout ou outras configurações
    // connectTimeout: 10000
});

// Função para testar a conexão (opcional, pode ser chamada na inicialização)
async function testConnection() {
    try {
        const conn = await pool.getConnection();
        console.log('✅ Conectado ao MySQL!');
        conn.release();
        return true;
    } catch (err) {
        console.error('❌ Erro ao conectar ao MySQL:', err.message);
        return false;
    }
}

module.exports = { pool, testConnection };