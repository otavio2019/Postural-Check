from pathlib import Path

from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from app.schemas.postural import AnalisePosturalRequest

api_router = APIRouter()

MAX_IMAGE_SIZE = 10 * 1024 * 1024
ALLOWED_IMAGE_TYPES = {
    "image/jpeg",
    "image/png",
    "image/webp",
}
ALLOWED_IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}


# Endpoint simples para confirmar que a aplicação foi iniciada corretamente.
@api_router.get("/")
def inicio():
    """Retorna uma mensagem inicial da API."""
    return {"mensagem": "API do Postural Check funcionando"}


@api_router.get("/health")
def verificar_saude():
    """Verifica se a API está online."""
    return {"status": "ok"}


# Nesta primeira versão, a rota apenas valida e devolve os dados recebidos.
# A análise real será delegada posteriormente a um serviço de domínio.
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


async def validar_imagem(arquivo: UploadFile, nome_campo: str) -> int:
    """Valida metadados, extensão, assinatura e tamanho de uma imagem."""
    if not arquivo.filename:
        raise HTTPException(
            status_code=400,
            detail=f"O arquivo {nome_campo} é obrigatório.",
        )

    extensao = Path(arquivo.filename).suffix.lower()
    if arquivo.content_type not in ALLOWED_IMAGE_TYPES or extensao not in ALLOWED_IMAGE_EXTENSIONS:
        raise HTTPException(
            status_code=415,
            detail=f"O arquivo {nome_campo} deve ser JPEG, PNG ou WEBP.",
        )

    conteudo = await arquivo.read(MAX_IMAGE_SIZE + 1)
    if len(conteudo) > MAX_IMAGE_SIZE:
        raise HTTPException(
            status_code=413,
            detail=f"O arquivo {nome_campo} deve ter no máximo 10 MB.",
        )

    assinatura_valida = (
        (arquivo.content_type == "image/jpeg" and conteudo.startswith(b"\xff\xd8\xff"))
        or (arquivo.content_type == "image/png" and conteudo.startswith(b"\x89PNG\r\n\x1a\n"))
        or (arquivo.content_type == "image/webp" and conteudo.startswith(b"RIFF") and conteudo[8:12] == b"WEBP")
    )

    if not assinatura_valida:
        raise HTTPException(
            status_code=415,
            detail=f"O conteúdo do arquivo {nome_campo} não corresponde a uma imagem válida.",
        )

    await arquivo.seek(0)
    return len(conteudo)


@api_router.post("/analise-postural/imagem")
async def analisar_postura_com_imagens(
    nome: str = Form(..., min_length=2, max_length=100),
    idade: int = Form(..., ge=1, le=120),
    observacoes: str | None = Form(None, max_length=500),
    imagem_frente: UploadFile = File(...),
    imagem_lateral: UploadFile = File(...),
    imagem_costas: UploadFile = File(...),
):
    """Recebe e valida as três vistas, sem armazená-las ou analisá-las ainda."""
    tamanho_frente = await validar_imagem(imagem_frente, "imagem_frente")
    tamanho_lateral = await validar_imagem(imagem_lateral, "imagem_lateral")
    tamanho_costas = await validar_imagem(imagem_costas, "imagem_costas")

    return {
        "mensagem": "As três imagens foram recebidas com sucesso",
        "nome": nome,
        "idade": idade,
        "observacoes": observacoes,
        "imagens": {
            "frente": {
                "nome_arquivo": imagem_frente.filename,
                "tipo": imagem_frente.content_type,
                "tamanho": tamanho_frente,
            },
            "lateral": {
                "nome_arquivo": imagem_lateral.filename,
                "tipo": imagem_lateral.content_type,
                "tamanho": tamanho_lateral,
            },
            "costas": {
                "nome_arquivo": imagem_costas.filename,
                "tipo": imagem_costas.content_type,
                "tamanho": tamanho_costas,
            },
        },
    }
