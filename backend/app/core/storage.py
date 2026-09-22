from __future__ import annotations

import io
import os
from dataclasses import dataclass

from minio import Minio


@dataclass(frozen=True)
class ImagemValidada:
    """Conteúdo validado que pode ser enviado ao armazenamento."""

    nome_arquivo: str
    tipo: str
    extensao: str
    conteudo: bytes

    @property
    def tamanho(self) -> int:
        return len(self.conteudo)


class MinioStorageError(RuntimeError):
    """Erro controlado de comunicação com o armazenamento."""


class MinioStorage:
    """Cliente MinIO para objetos privados do Postural Check."""

    def __init__(self) -> None:
        endpoint = os.getenv("MINIO_ENDPOINT", "localhost:9000")
        access_key = os.getenv("MINIO_ROOT_USER", "minioadmin")
        secret_key = os.getenv("MINIO_ROOT_PASSWORD", "minioadmin")
        secure = os.getenv("MINIO_SECURE", "false").lower() == "true"
        self.bucket = os.getenv("MINIO_BUCKET", "postural-images")
        self.client = Minio(
            endpoint,
            access_key=access_key,
            secret_key=secret_key,
            secure=secure,
        )

    def ensure_bucket(self) -> None:
        """Cria o bucket uma vez, caso ele ainda não exista."""
        try:
            if not self.client.bucket_exists(self.bucket):
                self.client.make_bucket(self.bucket)
        except Exception as error:
            raise MinioStorageError("Não foi possível preparar o bucket de imagens.") from error

    def salvar_imagens(
        self,
        analise_id: str,
        imagens: dict[str, ImagemValidada],
    ) -> dict[str, str]:
        """Salva as três imagens e remove objetos parciais se houver falha."""
        self.ensure_bucket()
        objetos_salvos: list[str] = []
        caminhos: dict[str, str] = {}

        try:
            for vista, imagem in imagens.items():
                caminho = f"analises/{analise_id}/{vista}{imagem.extensao}"
                self.client.put_object(
                    self.bucket,
                    caminho,
                    io.BytesIO(imagem.conteudo),
                    length=imagem.tamanho,
                    content_type=imagem.tipo,
                )
                objetos_salvos.append(caminho)
                caminhos[vista] = caminho
        except Exception as error:
            for caminho in objetos_salvos:
                try:
                    self.client.remove_object(self.bucket, caminho)
                except Exception:
                    pass
            raise MinioStorageError("Não foi possível armazenar as três imagens.") from error

        return caminhos


storage = MinioStorage()
