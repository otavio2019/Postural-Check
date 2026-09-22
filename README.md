# Postural Check

Estrutura inicial do projeto **Postural Check** preparada para desenvolvimento futuro com frontend em Next.js, backend em FastAPI e infraestrutura local com Docker Compose.

## Estrutura

```text
postural-check/
├── backend/
│   ├── app/
│   │   ├── analysis/
│   │   │   └── postural/
│   │   ├── api/
│   │   │   └── routes/
│   │   ├── core/
│   │   ├── integrations/
│   │   │   └── ai/
│   │   ├── models/
│   │   ├── processing/
│   │   │   └── images/
│   │   ├── schemas/
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
│   └── README.md
├── frontend/
│   ├── app/
│   ├── public/
│   ├── package.json
│   └── tsconfig.json
├── .gitignore
├── docker-compose.yml
└── README.md
```

## Tecnologias configuradas

- **Frontend:** Next.js, React, TypeScript e Tailwind CSS
- **Backend:** Python, FastAPI e Uvicorn
- **Banco de dados:** PostgreSQL (container preparado para uso futuro)
- **Armazenamento:** MinIO (container preparado para uso futuro)
- **Infraestrutura:** Docker e Docker Compose

## Como iniciar

### Rodando com Docker Compose

```bash
docker compose up --build
```

Serviços esperados:

- Frontend: http://localhost:3000
- Backend: http://localhost:8000
- Documentação automática do FastAPI: http://localhost:8000/docs
- MinIO API: http://localhost:9000
- MinIO Console: http://localhost:9001
- PostgreSQL: localhost:5432

### Rodando localmente

Frontend:

```bash
cd frontend
npm install
npm run dev
```

Backend:

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## Próximas implementações

Arquivos e módulos ainda deverão ser implementados conforme o desenvolvimento avançar:

- rotas reais em `backend/app/api/routes/`
- regras de negócio em `backend/app/services/`
- modelos e integração com banco em `backend/app/models/`
- schemas de entrada e saída em `backend/app/schemas/`
- configurações compartilhadas em `backend/app/core/`
- análise postural em `backend/app/analysis/postural/`
- processamento de imagens em `backend/app/processing/images/`
- integração com IA em `backend/app/integrations/ai/`
- componentes e páginas adicionais no frontend
- configuração de persistência, migrations e acesso ao banco
