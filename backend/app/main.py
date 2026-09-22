from fastapi import FastAPI

from app.api.router import api_router

app = FastAPI(
    title="Postural Check API",
    description="Base backend structure for the Postural Check project.",
    version="0.1.0",
)
app.include_router(api_router)
