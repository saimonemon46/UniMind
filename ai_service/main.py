from fastapi import FastAPI

app = FastAPI(title="Alma AI Service", version="0.1.0")


@app.get("/ai/v1/health")
def health_check():
    return {"data": {"status": "ok"}, "message": "AI service running", "success": True}
