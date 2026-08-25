from fastapi.testclient import TestClient
from ai_service.main import app

client = TestClient(app)


def test_health_check():
    response = client.get("/ai/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["data"]["status"] == "ok"
    assert data["message"] == "AI service running"
