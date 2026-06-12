import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import simulation
from scheduler.tasks import scheduler

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s — %(message)s")
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown lifecycle."""
    logger.info("🚀 AI Service starting up...")
    scheduler.start()
    logger.info("✅ APScheduler started")
    yield
    logger.info("Shutting down...")
    scheduler.shutdown(wait=False)


app = FastAPI(
    title="Startup Simulator AI Service",
    version="1.0.0",
    docs_url="/docs",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Internal service — locked down by Docker network
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health():
    return {"status": "healthy", "service": "ai-simulation"}


app.include_router(simulation.router)
