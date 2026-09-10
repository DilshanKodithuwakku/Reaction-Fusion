import sys
from pathlib import Path
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

ROOT = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(ROOT / "src"))
sys.path.insert(0, str(ROOT / "platform/backend"))

from app.routes.analyze import router as analyze_router
from reactionfusion.inference.predictor import ReactionFusionPredictor


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Pre-warm the model and extractors for v2
    predictor = ReactionFusionPredictor.get_default()
    print(f"ReactionFusion Backend ready! Active model: {predictor.dataset_version}")
    yield


app = FastAPI(
    title="ReactionFusion Facebook Plugin API",
    description="Multimodal Emotion and Sentiment Inference API for Facebook Extension",
    version="2.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(analyze_router)


@app.get("/api/v1/health")
def health_check():
    predictor = ReactionFusionPredictor.get_default()
    return {
        "status": "healthy",
        "service": "ReactionFusion Chrome Extension Backend",
        "model_version": predictor.dataset_version,
        "num_emotions": 22,
        "optimal_thresholds_configured": len(predictor.optimal_thresholds) > 0
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
