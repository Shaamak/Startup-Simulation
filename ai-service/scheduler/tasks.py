"""
APScheduler-based background task manager.
Manages per-startup simulation tick jobs.
"""
import asyncio
import logging
from typing import Dict
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger
import httpx
from config import settings
from services.simulation_engine import SimulationEngine

logger = logging.getLogger(__name__)

scheduler = AsyncIOScheduler()
active_engines: Dict[str, SimulationEngine] = {}


async def _run_tick(startup_id: str, engine: SimulationEngine):
    """Fetch current state, compute next tick, push to backend."""
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            # Get current simulation state from backend
            resp = await client.get(
                f"{settings.BACKEND_URL}/api/simulations/{startup_id}",
                headers={"X-Internal-Service": "ai-service"},
            )
            if resp.status_code != 200:
                logger.warning(f"Failed to fetch state for {startup_id}: {resp.status_code}")
                return

            state = resp.json().get("data", {})
            new_state = engine.tick(state)

            # Push tick result back to backend
            await client.post(
                f"{settings.BACKEND_URL}/api/simulations/{startup_id}/tick",
                json=new_state,
                headers={"X-Internal-Service": "ai-service"},
            )
            logger.debug(f"Tick complete for {startup_id}: day {new_state['day']}, customers {new_state['customers']}")

    except httpx.RequestError as e:
        logger.error(f"Network error during tick for {startup_id}: {e}")
    except Exception as e:
        logger.error(f"Tick error for {startup_id}: {e}")


def start_simulation(
    startup_id: str,
    industry: str,
    pricing_model: str,
    monthly_budget: float,
    category: str,
):
    """Start a simulation job for a startup."""
    if startup_id in active_engines:
        logger.info(f"Simulation already running for {startup_id}")
        return

    engine = SimulationEngine(
        startup_id=startup_id,
        industry=industry,
        pricing_model=pricing_model,
        monthly_budget=monthly_budget,
        category=category,
    )
    active_engines[startup_id] = engine

    scheduler.add_job(
        func=_run_tick,
        trigger=IntervalTrigger(seconds=settings.TICK_INTERVAL_SECONDS),
        args=[startup_id, engine],
        id=f"sim_{startup_id}",
        replace_existing=True,
        max_instances=1,
    )
    logger.info(f"Started simulation for {startup_id} (every {settings.TICK_INTERVAL_SECONDS}s)")


def stop_simulation(startup_id: str):
    """Stop a simulation job."""
    job_id = f"sim_{startup_id}"
    if scheduler.get_job(job_id):
        scheduler.remove_job(job_id)
    active_engines.pop(startup_id, None)
    logger.info(f"Stopped simulation for {startup_id}")


def get_active_simulations() -> list:
    return list(active_engines.keys())
