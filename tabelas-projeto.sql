CREATE DATABASE personal_trainer;
USE personal_trainer;

-- Tabela admins
CREATE TABLE admins (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO admins (username, password) VALUES ('italo', 'italoruan123');

-- Tabela alunos
CREATE TABLE alunos (
    id VARCHAR(50) PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- Tabela treinos_padroes


-- Optei por usar JSON porque a estrutura dos treinos
-- é variável e não precisamos fazer consultas analíticas
-- complexas. Para as operações que o sistema faz – exibir
-- treino, marcar exercícios como concluídos – o JSON é 
-- simples e eficiente. Se no futuro o sistema crescer e
-- precisarmos de relatórios mais elaborados, podemos 
-- migrar para uma estrutura normalizada sem impactar o
--  frontend, apenas alterando as queries do backend.


CREATE TABLE treinos_padroes (
    id INT PRIMARY KEY DEFAULT 1,
    treino JSON NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO treinos_padroes (id, treino) VALUES (1, '{}');

-- Tabela treinos
CREATE TABLE treinos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    aluno_id VARCHAR(50) NOT NULL,
    treino JSON NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (aluno_id) REFERENCES alunos(id) ON DELETE CASCADE
);

-- Tabela progresso
CREATE TABLE progresso (
    id INT PRIMARY KEY AUTO_INCREMENT,
    aluno_id VARCHAR(50) NOT NULL,
    progresso JSON NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (aluno_id) REFERENCES alunos(id) ON DELETE CASCADE
);

-- Tabela checkins
CREATE TABLE checkins (
    id INT PRIMARY KEY AUTO_INCREMENT,
    aluno_id VARCHAR(50) NOT NULL,
    aluno_nome VARCHAR(100),
    gym_name VARCHAR(200),
    gym_address TEXT,
    distance_m INT,
    lat_aluno DECIMAL(10,8),
    lng_aluno DECIMAL(11,8),
    lat_gym DECIMAL(10,8),
    lng_gym DECIMAL(11,8),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (aluno_id) REFERENCES alunos(id) ON DELETE CASCADE
);






