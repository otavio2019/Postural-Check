from fastapi import APIRouter

api_router = APIRouter()


@api_router.get("/")
def inicio():
    """Retorna uma mensagem inicial da API."""
    return {"mensagem": "API do Postural Check funcionando"}


@api_router.get("/health")
def verificar_saude():
    """Verifica se a API está online."""
    return {"status": "ok"}
