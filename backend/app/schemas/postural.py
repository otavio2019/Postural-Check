from pydantic import BaseModel, Field


class AnalisePosturalRequest(BaseModel):
    """Dados enviados para iniciar uma análise postural."""

    nome: str = Field(min_length=2, max_length=100)
    idade: int = Field(ge=1, le=120)
    observacoes: str | None = Field(default=None, max_length=500)
