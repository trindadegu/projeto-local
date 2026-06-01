select *
from alunos;


SELECT 
    a.nome,
    t.treino,
    t.updated_at
FROM treinos t
JOIN alunos a ON t.aluno_id = a.id;

-- Listar alunos com seus respectivos IDs e datas de criação
SELECT id, nome, DATE(created_at) AS data_cadastro
FROM alunos
ORDER BY created_at DESC;

-- O MySQL tem funções para consultar dentro de JSON:
-- JSON_EXTRACT, JSON_CONTAINS, ->>, etc.
--  JSON_EXTRACT extrair um valor de dentro do json usando
-- um path(caminho)

SELECT a.nome, 
       JSON_EXTRACT(t.treino, '$.segunda.exercises') AS exercicios_segunda
FROM alunos a
JOIN treinos t ON a.id = t.aluno_id
WHERE JSON_SEARCH(t.treino, 'one', 'Supino reto', NULL, '$.segunda.exercises[*].name') IS NOT NULL;
-- procurar um valor dentro do JSON e retorna o path

-- JSON_LENGHT retorna o número de elementos de um array
-- dentro do JSON
SELECT a.nome, 
       JSON_LENGTH(JSON_EXTRACT(t.treino, '$.segunda.exercises')) AS total_exercicios_segunda
FROM alunos a
JOIN treinos t ON a.id = t.aluno_id;



SELECT a.nome, 
       JSON_LENGTH(JSON_EXTRACT(p.progresso, '$.terca')) AS concluidos_terca
FROM alunos a
JOIN progresso p ON a.id = p.aluno_id
WHERE JSON_LENGTH(JSON_EXTRACT(p.progresso, '$.terca')) >= 1;



