from pathlib import Path
from uuid import uuid4

from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from app.core.storage import ImagemValidada, MinioStorageError, storage
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


async def validar_imagem(arquivo: UploadFile, nome_campo: str) -> ImagemValidada:
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
    extensao_normalizada = ".jpg" if arquivo.content_type == "image/jpeg" else extensao

    return ImagemValidada(
        nome_arquivo=arquivo.filename,
        tipo=arquivo.content_type,
        extensao=extensao_normalizada,
        conteudo=conteudo,
    )


@api_router.post("/analise-postural/imagem")
async def analisar_postura_com_imagens(
    nome: str = Form(..., min_length=2, max_length=100),
    idade: int = Form(..., ge=1, le=120),
    observacoes: str | None = Form(None, max_length=500),
    imagem_frente: UploadFile = File(...),
    imagem_lateral: UploadFile = File(...),
    imagem_costas: UploadFile = File(...),
):
    """Recebe, valida e armazena as três vistas, sem analisá-las ainda."""
    imagens = {
        "frente": await validar_imagem(imagem_frente, "imagem_frente"),
        "lateral": await validar_imagem(imagem_lateral, "imagem_lateral"),
        "costas": await validar_imagem(imagem_costas, "imagem_costas"),
    }
    analise_id = uuid4().hex

    try:
        caminhos = storage.salvar_imagens(analise_id, imagens)
    except MinioStorageError as error:
        raise HTTPException(
            status_code=503,
            detail="Não foi possível armazenar as imagens no MinIO.",
        ) from error

    return {
        "mensagem": "As três imagens foram armazenadas com sucesso",
        "nome": nome,
        "idade": idade,
        "observacoes": observacoes,
        "status": "imagens_armazenadas",
        "analise_id": analise_id,
        "imagens": {
            "frente": {
                "nome_arquivo": imagens["frente"].nome_arquivo,
                "tipo": imagens["frente"].tipo,
                "tamanho": imagens["frente"].tamanho,
                "caminho": caminhos["frente"],
            },
            "lateral": {
                "nome_arquivo": imagens["lateral"].nome_arquivo,
                "tipo": imagens["lateral"].tipo,
                "tamanho": imagens["lateral"].tamanho,
                "caminho": caminhos["lateral"],
            },
            "costas": {
                "nome_arquivo": imagens["costas"].nome_arquivo,
                "tipo": imagens["costas"].tipo,
                "tamanho": imagens["costas"].tamanho,
                "caminho": caminhos["costas"],
            },
        },
    }
