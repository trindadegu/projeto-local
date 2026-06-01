
require('dotenv').config();


const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());                 // Permite requisições do frontend (portas diferentes)
app.use(express.json());        // Parseia JSON do corpo da requisição

// ========================== CONEXÃO COM MySQL ==========================
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',       // Altere para seu usuário MySQL
    password: 'senai103',       // Altere para sua senha
    database: 'personal_trainer',
    waitForConnections: true,
    connectionLimit: 10
});

// Testa conexão ao iniciar (opcional)
(async () => {
    try {
        const conn = await pool.getConnection();
        console.log('✅ Conectado ao MySQL!');
        conn.release();
    } catch (err) {
        console.error('❌ Erro ao conectar ao MySQL:', err.message);
        process.exit(1);
    }
})();

// ========================== ROTAS ==========================

// ----- ADMIN: login -----
app.post('/api/admin/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const [rows] = await pool.query(
            'SELECT * FROM admins WHERE username = ? AND password = ?',
            [username, password]
        );
        if (rows.length) return res.json({ success: true, user: rows[0] });
        res.status(401).json({ error: 'Credenciais inválidas' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ----- ALUNOS (CRUD) -----
app.get('/api/alunos', async (req, res) => {
    const [rows] = await pool.query('SELECT * FROM alunos ORDER BY nome');
    res.json(rows);
});

app.post('/api/alunos', async (req, res) => {
    const { id, nome } = req.body;
    const emptyTraining = {
        segunda: { focus: '', exercises: [] },
        terca: { focus: '', exercises: [] },
        quarta: { focus: '', exercises: [] },
        quinta: { focus: '', exercises: [] },
        sexta: { focus: '', exercises: [] }
    };
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        await connection.query('INSERT INTO alunos (id, nome) VALUES (?, ?)', [id, nome]);
        await connection.query('INSERT INTO treinos (aluno_id, treino) VALUES (?, ?)', [id, JSON.stringify(emptyTraining)]);
        await connection.query('INSERT INTO progresso (aluno_id, progresso) VALUES (?, ?)', [id, JSON.stringify({})]);
        await connection.commit();
        res.status(201).json({ message: 'Aluno criado' });
    } catch (err) {
        await connection.rollback();
        res.status(500).json({ error: err.message });
    } finally {
        connection.release();
    }
});

app.delete('/api/alunos/:id', async (req, res) => {
    const { id } = req.params;
    await pool.query('DELETE FROM alunos WHERE id = ?', [id]);
    res.json({ message: 'Aluno removido' });
});

// ----- TREINOS INDIVIDUAIS -----
app.get('/api/treinos/:alunoId', async (req, res) => {
    const { alunoId } = req.params;
    const [rows] = await pool.query('SELECT treino FROM treinos WHERE aluno_id = ?', [alunoId]);
    if (rows.length) return res.json(rows[0].treino);
    res.json({}); // retorna vazio se não existir
});

app.put('/api/treinos/:alunoId', async (req, res) => {
    const { alunoId } = req.params;
    const treino = req.body;
    await pool.query('UPDATE treinos SET treino = ? WHERE aluno_id = ?', [JSON.stringify(treino), alunoId]);
    res.json({ message: 'Treino salvo' });
});

// ----- PROGRESSO -----
app.get('/api/progresso/:alunoId', async (req, res) => {
    const { alunoId } = req.params;
    const [rows] = await pool.query('SELECT progresso FROM progresso WHERE aluno_id = ?', [alunoId]);
    if (rows.length) return res.json(rows[0].progresso);
    res.json({});
});

app.put('/api/progresso/:alunoId', async (req, res) => {
    const { alunoId } = req.params;
    const progresso = req.body;
    await pool.query('UPDATE progresso SET progresso = ? WHERE aluno_id = ?', [JSON.stringify(progresso), alunoId]);
    res.json({ message: 'Progresso salvo' });
});

// ----- TREINO PADRÃO -----
app.get('/api/treinos-padrao', async (req, res) => {
    const [rows] = await pool.query('SELECT treino FROM treinos_padroes WHERE id = 1');
    if (rows.length) return res.json(rows[0].treino);
    res.json({});
});

app.put('/api/treinos-padrao', async (req, res) => {
    const treino = req.body;
    await pool.query('UPDATE treinos_padroes SET treino = ? WHERE id = 1', [JSON.stringify(treino)]);
    res.json({ message: 'Treino padrão salvo' });
});

// ----- CHECK-INS -----
app.get('/api/checkins', async (req, res) => {
    const [rows] = await pool.query('SELECT * FROM checkins ORDER BY created_at DESC');
    res.json(rows);
});

app.post('/api/checkins', async (req, res) => {
    const checkin = req.body;
    await pool.query(
        `INSERT INTO checkins 
        (aluno_id, aluno_nome, gym_name, gym_address, distance_m, lat_aluno, lng_aluno, lat_gym, lng_gym) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [checkin.aluno_id, checkin.aluno_nome, checkin.gym_name, checkin.gym_address,
         checkin.distance_m, checkin.lat_aluno, checkin.lng_aluno, checkin.lat_gym, checkin.lng_gym]
    );
    res.status(201).json({ message: 'Check-in registrado' });
});

// Rota extra: limpar todos os check-ins (para o admin)
app.delete('/api/checkins', async (req, res) => {
    await pool.query('DELETE FROM checkins');
    res.json({ message: 'Todos os check-ins foram removidos' });
});

// ----- ADMIN: alterar senha -----
app.put('/api/admin/senha', async (req, res) => {
    const { newPassword } = req.body;
    await pool.query('UPDATE admins SET password = ? WHERE username = "italo"', [newPassword]);
    res.json({ message: 'Senha alterada' });
});

// ========================== INICIAR SERVIDOR ==========================
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
});

