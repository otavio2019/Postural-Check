from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.router import api_router

app = FastAPI(
    title="Postural Check API",
    description="Base backend structure for the Postural Check project.",
    version="0.1.0",
)

# O frontend local roda em outra origem (porta 3000), por isso precisa de
# permissão explícita para acessar a API durante o desenvolvimento.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mantém as rotas agrupadas em um único módulo para facilitar a expansão da API.
app.include_router(api_router)
