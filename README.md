# Postural Check

Estrutura inicial do projeto preparada para desenvolvimento futuro, sem implementação de regras de negócio, IA, autenticação, análise postural ou processamento de imagens.

## Estrutura de pastas

```text
postural-check/
├── frontend/                 # Next.js + TypeScript + Tailwind CSS
├── backend/                  # FastAPI (estrutura base)
│   └── app/
│       ├── api/routes/
│       ├── services/
│       ├── models/
│       ├── schemas/
│       ├── analysis/
│       ├── image_processing/
│       └── ai/
├── docker/
├── docs/
├── .gitignore
├── README.md
└── docker-compose.yml
```

## Tecnologias configuradas

- **Frontend:** Next.js, TypeScript, Tailwind CSS
- **Backend:** Python, FastAPI
- **Banco de dados (infra):** PostgreSQL (Docker Compose)
- **Armazenamento (infra):** MinIO (Docker Compose)
- **Infraestrutura:** Docker e Docker Compose

## Comandos para iniciar

### 1) Subir serviços de infraestrutura (PostgreSQL + MinIO)

```bash
docker compose up -d
```

### 2) Rodar frontend

```bash
cd frontend
npm install
npm run dev
```

### 3) Rodar backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## Itens para implementar posteriormente

- Rotas de negócio da API
- Serviços e regras de negócio
- Modelos e schemas de domínio
- Análise postural
- Processamento de imagens
- Integração com IA
- Definição de migrations e modelagem de banco
- Dockerfiles de frontend/backend (quando necessário)
