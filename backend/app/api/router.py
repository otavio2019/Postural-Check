from fastapi import APIRouter

from app.schemas.postural import AnalisePosturalRequest

api_router = APIRouter()


@api_router.get("/")
def inicio():
    """Retorna uma mensagem inicial da API."""
    return {"mensagem": "API do Postural Check funcionando"}


@api_router.get("/health")
def verificar_saude():
    """Verifica se a API está online."""
    return {"status": "ok"}


@api_router.post("/analise-postural")
def analisar_postura(dados: AnalisePosturalRequest):
    """Recebe os dados básicos para iniciar uma análise postural."""
    return {
        "mensagem": "Dados recebidos com sucesso",
        "paciente": dados.nome,
        "idade": dados.idade,
        "observacoes": dados.observacoes,
        "resultado": "Análise postural ainda será implementada",
    }
