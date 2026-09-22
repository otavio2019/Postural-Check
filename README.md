# Postural Check

O **Postural Check** é uma aplicação web em desenvolvimento para apoiar a análise postural a partir de imagens. O projeto foi preparado com frontend em Next.js, backend em Python com FastAPI e infraestrutura local executada pelo Docker Compose.

> **Estado atual:** a primeira integração entre o frontend e o backend está funcionando. O sistema já envia nome, idade e observações para a API. A análise postural por imagem ainda não foi implementada.

## Progresso do projeto

### O que já foi feito

- Estrutura inicial do projeto separada entre `frontend` e `backend`.
- Frontend criado com Next.js, React, TypeScript e Tailwind CSS.
- Backend criado com Python, FastAPI e Uvicorn.
- Endpoint `GET /` para confirmar que a API está funcionando.
- Endpoint `GET /health` para verificar a saúde da API.
- Endpoint `POST /analise-postural` para receber nome, idade e observações.
- Validação dos dados recebidos com Pydantic.
- Formulário inicial conectado ao backend usando `fetch`.
- Mensagens de carregamento, sucesso e erro no frontend.
- CORS configurado para `localhost:3000` e `127.0.0.1:3000`.
- Docker Compose configurado para frontend, backend, PostgreSQL e MinIO.
- Imagem oficial do MinIO configurada pelo registry `quay.io`.
- Plano de desenvolvimento registrado em [`docs/PROXIMOS_PASSOS.md`](docs/PROXIMOS_PASSOS.md).

### O que ainda falta

A implementação está no início. As próximas tarefas são:

1. Adicionar seleção de imagem no formulário.
2. Criar a rota `POST /analise-postural/imagem`.
3. Validar extensão, tipo e tamanho da imagem no backend.
4. Enviar a imagem do frontend usando `FormData`.
5. Armazenar imagens no MinIO.
6. Criar registros das análises no PostgreSQL.
7. Processar a imagem para identificar pontos corporais.
8. Calcular medidas e possíveis assimetrias posturais.
9. Exibir o resultado da análise no frontend.
10. Criar histórico e exclusão de análises.
11. Adicionar testes automatizados.
12. Revisar segurança, autenticação e proteção de dados antes de publicar.

A prioridade imediata é implementar o **upload de uma imagem sem análise automática**. Primeiro vamos confirmar que a imagem consegue percorrer corretamente o caminho `frontend → FastAPI → frontend`. A detecção postural será feita em uma etapa posterior.

## Tecnologias

- **Frontend:** Next.js, React, TypeScript e Tailwind CSS.
- **Backend:** Python, FastAPI, Uvicorn e Pydantic.
- **Banco de dados:** PostgreSQL, preparado para guardar os dados das análises.
- **Armazenamento:** MinIO, compatível com o padrão S3, preparado para guardar imagens.
- **Infraestrutura:** Docker e Docker Compose.

## Estrutura do projeto

```text
Postural-Check/
├── backend/
│   ├── app/
│   │   ├── analysis/
│   │   │   └── postural/
│   │   ├── api/
│   │   │   ├── routes/
│   │   │   └── router.py
│   │   ├── core/
│   │   ├── integrations/
│   │   │   └── ai/
│   │   ├── models/
│   │   ├── processing/
│   │   │   └── images/
│   │   ├── schemas/
│   │   │   └── postural.py
│   │   ├── services/
│   │   └── main.py
│   ├── README.md
│   └── requirements.txt
├── docker/
│   ├── backend/
│   │   └── Dockerfile
│   └── frontend/
│       └── Dockerfile
├── docs/
│   ├── PROXIMOS_PASSOS.md
│   └── README.md
├── frontend/
│   ├── app/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── public/
│   ├── package.json
│   └── tsconfig.json
├── .gitignore
├── docker-compose.yml
└── README.md
```

## Como executar com Docker no VS Code

No Windows, não é necessário instalar Python para executar o projeto quando o Docker estiver funcionando. O backend Python será executado dentro do container.

Abra a pasta do projeto no VS Code e abra o terminal integrado com `Ctrl + ``. Depois execute:

```powershell
git pull origin main
docker compose up --build
```

Na primeira execução, o Docker poderá demorar alguns minutos para baixar as imagens e construir os containers. Mantenha esse terminal aberto enquanto estiver usando o sistema.

Acesse os serviços nestes endereços:

| Serviço | Endereço |
|---|---|
| Frontend | http://localhost:3000 |
| API do backend | http://localhost:8000 |
| Documentação da API | http://localhost:8000/docs |
| MinIO API | http://localhost:9000 |
| Console do MinIO | http://localhost:9001 |
| PostgreSQL | localhost:5432 |

As credenciais locais configuradas para o console do MinIO são:

```text
Usuário: minioadmin
Senha: minioadmin
```

Para verificar o estado dos containers em outro terminal do VS Code:

```powershell
docker compose ps
```

Para visualizar os logs do backend:

```powershell
docker compose logs -f backend
```

Para parar os serviços:

```powershell
docker compose down
```

Para iniciar novamente sem reconstruir as imagens:

```powershell
docker compose up
```

Use `docker compose up --build` novamente quando houver alterações no `Dockerfile`, no `requirements.txt`, no `package.json` ou na configuração do Compose.

## Como executar sem Docker

Essa opção exige Python e Node.js instalados no computador. No Windows PowerShell, o ambiente Python é ativado com um comando diferente do Linux.

### Frontend

```powershell
cd frontend
npm install
npm run dev
```

### Backend no Windows PowerShell

```powershell
cd backend
py -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Backend no Linux ou macOS

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## Rotas disponíveis

### `GET /`

Confirma que a API está funcionando.

Resposta esperada:

```json
{
  "mensagem": "API do Postural Check funcionando"
}
```

### `GET /health`

Verifica se a API está online.

Resposta esperada:

```json
{
  "status": "ok"
}
```

### `POST /analise-postural`

Recebe os dados básicos do formulário atual.

Exemplo de requisição:

```json
{
  "nome": "Otavio",
  "idade": 21,
  "observacoes": "O lado direito tem uma leve inclinação para baixo"
}
```

Neste momento, a resposta confirma o recebimento dos dados, mas ainda não apresenta uma análise postural real.

## Como testar a API

Abra a documentação automática:

```text
http://localhost:8000/docs
```

Na tela do FastAPI:

1. Localize a rota que deseja testar.
2. Clique em **Try it out**.
3. Preencha os dados solicitados.
4. Clique em **Execute**.
5. Verifique o código HTTP e a resposta.

Também é possível testar a rota pelo PowerShell:

```powershell
Invoke-RestMethod `
  -Uri "http://localhost:8000/analise-postural" `
  -Method Post `
  -ContentType "application/json" `
  -Body '{"nome":"Otavio","idade":21,"observacoes":"Teste"}'
```

## Próxima tarefa detalhada

A próxima implementação será o upload de uma imagem. Ela será dividida em pequenas mudanças:

1. Alterar `frontend/app/page.tsx` para adicionar um campo `input type="file"`.
2. Guardar o arquivo selecionado em um estado React.
3. Validar no frontend se o arquivo é uma imagem e se possui até 10 MB.
4. Criar `backend/app/api/routes/postural.py`.
5. Criar a rota `POST /analise-postural/imagem` usando `UploadFile`.
6. Validar novamente o tipo e o tamanho no backend.
7. Enviar a imagem com `FormData`.
8. Testar primeiro em `http://localhost:8000/docs`.
9. Testar depois pelo formulário do frontend.
10. Somente após o upload funcionar, adicionar o armazenamento no MinIO.

O resultado esperado da primeira versão do upload será semelhante a:

```json
{
  "mensagem": "Imagem recebida com sucesso",
  "nome_arquivo": "foto-postura.jpg",
  "tipo": "image/jpeg"
}
```

Essa etapa não fará diagnóstico, não calculará ângulos e não usará inteligência artificial. O objetivo é validar o caminho técnico do arquivo.

## Git e fluxo de trabalho

Antes de começar uma tarefa:

```powershell
git pull origin main
```

Depois de validar uma alteração:

```powershell
git status
git diff --check
git add .
git commit -m "descricao da alteracao"
git push origin main
```

Não envie para o Git:

- arquivos `.env` com credenciais reais;
- pastas `node_modules`;
- pastas `.venv`;
- pastas `.next`;
- arquivos temporários;
- logs que contenham dados sensíveis.

## Limites e cuidados do projeto

O resultado da aplicação deverá ser apresentado como **estimativa técnica** ou **possível assimetria**. A aplicação não deve apresentar uma conclusão médica nem substituir uma avaliação profissional.

As imagens podem conter dados pessoais. Antes de publicar o sistema, será necessário definir política de armazenamento, controle de acesso, tempo de retenção e exclusão dos arquivos.

## Planejamento completo

O planejamento detalhado de arquitetura, etapas e critérios de conclusão está em [`docs/PROXIMOS_PASSOS.md`](docs/PROXIMOS_PASSOS.md).
