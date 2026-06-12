from pydantic import BaseModel
from typing import Optional


class StartupConfig(BaseModel):
    startupId: str
    industry: str
    pricingModel: str
    monthlyBudget: float
    targetAudience: str
    category: str


class SimulationState(BaseModel):
    startup_id: str
    simulation_day: int
    customers: int
    mrr: float
    churn_rate: float
    valuation: float
    runway_months: int
    popularity_score: float
    investor_interest: float
    funding_raised: float
    funding_round: str
    total_revenue: float
    burn_rate: float
    events: list[dict]


class SimulationEvent(BaseModel):
    event_type: str
    title: str
    description: str
    impact: str  # "positive" | "negative" | "neutral"
