from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from services.predictor import predict_concentration, registry

router = APIRouter(prefix="/api", tags=["Predict"])

@router.post("/predict")
async def predict_api(
    file: UploadFile = File(...),
    test_type: str = Form(...)
):
    content = await file.read()
    if not content:
        raise HTTPException(status_code=400, detail="File kosong")

    try:
        # services/predictor.py now uses a scalable registry
        result = predict_concentration(content, test_type)
    except ValueError as b:
        # Handle unsupported metal errors from registry
        raise HTTPException(status_code=400, detail=str(b))
    except Exception as e:
        # Handle other internal errors
        raise HTTPException(status_code=500, detail=str(e))

    return {
        "rgb": result["rgb"],
        "concentration_mg_per_L": result["concentration"],
        "status": result["status"]
    }
