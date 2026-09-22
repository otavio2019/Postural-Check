# Backend

A migração do backend de Python/FastAPI para Node.js/TypeScript está sendo feita em etapas.

## Estado atual

A estrutura inicial do novo backend já foi criada com:

- Node.js e TypeScript;
- Fastify;
- Prisma ORM;
- PostgreSQL;
- MinIO;
- schema Prisma para análises com três imagens.

O FastAPI antigo ainda permanece no repositório durante a migração. As rotas só serão transferidas para o servidor Node depois que a nova base for validada.

## Estrutura Node.js

```text
backend/
├── prisma/
│   └── schema.prisma
├── src/
│   ├── lib/
│   │   └── prisma.ts
│   └── server.ts
├── .env.example
├── package.json
└── tsconfig.json
```

## Configuração local

Copie o arquivo de ambiente:

```bash
cp .env.example .env
```

No Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Instale as dependências:

```bash
npm install
```

Valide e gere o Prisma Client:

```bash
npx prisma validate
npx prisma generate
```

Compile o backend:

```bash
npm run build
```

A migration e a alteração do Docker Compose serão feitas depois que o primeiro endpoint Node substituir a rota equivalente do FastAPI.
