from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from ai_service.routers.ai_router import router as ai_router

app = FastAPI(title="Alma AI Service", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(ai_router)


@app.get("/ai/v1/health")
def health_check():
    return {"data": {"status": "ok"}, "message": "AI service running", "success": True}
