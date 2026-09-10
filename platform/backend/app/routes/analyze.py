import sys
from pathlib import Path
from fastapi import APIRouter, HTTPException

ROOT = Path(__file__).resolve().parent.parent.parent.parent
sys.path.insert(0, str(ROOT / "src"))

from reactionfusion.inference.predictor import ReactionFusionPredictor
from app.schemas import AnalyzeRequest, AnalyzeResponse

router = APIRouter(prefix="/api/v1", tags=["Analysis"])


@router.post("/analyze", response_model=AnalyzeResponse)
def analyze_comments_and_post_reactions(req: AnalyzeRequest):
    """
    Main multimodal inference endpoint.
    Accepts:
      - comments: list of comment strings under the post (NO post text used).
      - reactions: post's 7 reaction counts (Like, Love, Care, Haha, Wow, Sad, Angry).
    Returns:
      - Multimodal sentiment & emotion classification.
    """
    try:
        predictor = ReactionFusionPredictor.get_default()
        result = predictor.predict(
            comments=req.comments,
            post_reactions=req.reactions
        )
        result["post_id"] = req.post_id
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inference error: {str(e)}")
