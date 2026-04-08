import os
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.predict import router

# LOAD ENV
load_dotenv()

# APP INIT
app = FastAPI(title="Tutor AI Farmasi - Prediction Engine")

# CORS CONFIG
raw_origin = os.getenv("WEB_APP_URL", "http://localhost:3000")
origins = [raw_origin.rstrip("/")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Welcome to Tutor AI Farmasi Prediction Engine"}

# REGISTER ROUTERS
app.include_router(router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=5000, reload=True)
