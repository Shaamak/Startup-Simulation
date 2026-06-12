from fastapi import APIRouter, HTTPException
from models.simulation import StartupConfig
from scheduler.tasks import start_simulation, stop_simulation, get_active_simulations

router = APIRouter(prefix="/simulate", tags=["simulation"])


@router.post("/start")
async def start(config: StartupConfig):
    """Start a background simulation for a startup."""
    start_simulation(
        startup_id=config.startupId,
        industry=config.industry,
        pricing_model=config.pricingModel,
        monthly_budget=config.monthlyBudget,
        category=config.category,
    )
    return {"success": True, "message": f"Simulation started for {config.startupId}"}


@router.post("/stop")
async def stop(payload: dict):
    """Stop a running simulation."""
    startup_id = payload.get("startupId")
    if not startup_id:
        raise HTTPException(status_code=422, detail="startupId is required")
    stop_simulation(startup_id)
    return {"success": True, "message": f"Simulation stopped for {startup_id}"}


@router.get("/active")
async def active():
    """List all currently running simulations."""
    return {"success": True, "data": get_active_simulations()}
