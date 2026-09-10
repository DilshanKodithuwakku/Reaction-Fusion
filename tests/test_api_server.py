import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "src"))
sys.path.insert(0, str(ROOT / "platform/backend"))

from fastapi.testclient import TestClient
from app.main import app

def test_api():
    with TestClient(app) as client:
        # 1. Health check
        r_health = client.get("/api/v1/health")
        assert r_health.status_code == 200
        health = r_health.json()
        print("Health check OK:", health)
        assert health["model_version"] == "emotion_22_v2"

        # 2. Analyze post comments + post reactions
        r_analyze = client.post("/api/v1/analyze", json={
            "comments": [
                "අපෝ මෙහෙමත් කරදරයක්... තව බදු ගහයි 😅",
                "සහන නෙවෙයි තවත් බර පටවනවා",
                "දෙයියන්ගෙම පිහිටයි රටට... සහන දෙයි ලඟදීම"
            ],
            "reactions": {
                "like": 1400,
                "love": 30,
                "care": 10,
                "haha": 920,
                "wow": 45,
                "sad": 210,
                "angry": 850
            }
        })
        assert r_analyze.status_code == 200
        data = r_analyze.json()
        print("\nDirect /api/v1/analyze output:")
        print(f"  Dataset: {data['dataset_version']}")
        print(f"  Text Source: {data['text_source']}")
        print(f"  Comments Analyzed: {data['comments_analyzed']}")
        print(f"  Post Reactions Total: {data['reactions_summary']['total']}")
        print(f"  Sentiment: {data['sentiment'].upper()} (Confidence: {data['confidence']})")
        print(f"  Dominant: {data['dominant_emotions']}")
        print(f"  Reason: {data['reason']}")

        # 3. Test zero comments edge case
        r_empty = client.post("/api/v1/analyze", json={
            "comments": [],
            "reactions": {"like": 100}
        })
        assert r_empty.status_code == 200
        empty_data = r_empty.json()
        print(f"\nZero comments response: status={empty_data['status']}, msg={empty_data['message']}")

    print("\nALL BACKEND TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    test_api()
