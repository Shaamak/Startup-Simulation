"""
Core simulation engine.
Uses realistic mathematical models for:
- Customer acquisition (S-curve growth)
- Churn rate (industry-tuned)
- Revenue (pricing model dependent)
- Burn rate (budget + headcount proxy)
- Valuation (ARR multiple)
- Investor interest (momentum-based)
- Funding rounds (threshold triggers)
"""
import random
import math
from typing import Optional
from models.simulation import SimulationState, SimulationEvent


# ─── Industry Multipliers ──────────────────────────────────────────────────────

INDUSTRY_PROFILES = {
    "SaaS": {"growth_base": 0.18, "churn_base": 0.05, "rev_multiple": 8.0},
    "Fintech": {"growth_base": 0.14, "churn_base": 0.04, "rev_multiple": 6.0},
    "HealthTech": {"growth_base": 0.10, "churn_base": 0.03, "rev_multiple": 7.0},
    "EdTech": {"growth_base": 0.12, "churn_base": 0.08, "rev_multiple": 4.0},
    "E-commerce": {"growth_base": 0.20, "churn_base": 0.12, "rev_multiple": 2.0},
    "Gaming": {"growth_base": 0.25, "churn_base": 0.15, "rev_multiple": 3.0},
    "AI/ML": {"growth_base": 0.22, "churn_base": 0.06, "rev_multiple": 10.0},
    "CleanTech": {"growth_base": 0.08, "churn_base": 0.02, "rev_multiple": 5.0},
    "PropTech": {"growth_base": 0.09, "churn_base": 0.03, "rev_multiple": 5.0},
    "LegalTech": {"growth_base": 0.08, "churn_base": 0.04, "rev_multiple": 6.0},
    "Other": {"growth_base": 0.12, "churn_base": 0.07, "rev_multiple": 4.0},
}

PRICING_ARPU = {
    "freemium": 15.0,
    "subscription": 49.0,
    "one-time": 200.0,
    "usage-based": 80.0,
    "marketplace": 30.0,
}

FUNDING_ROUNDS = ["pre-seed", "seed", "series-a", "series-b", "series-c", "ipo"]
FUNDING_THRESHOLDS = {
    "seed": 100_000,       # $100K ARR
    "series-a": 1_000_000,  # $1M ARR
    "series-b": 5_000_000,
    "series-c": 20_000_000,
    "ipo": 100_000_000,
}


# ─── Main Simulation Engine ────────────────────────────────────────────────────

class SimulationEngine:
    def __init__(
        self,
        startup_id: str,
        industry: str,
        pricing_model: str,
        monthly_budget: float,
        category: str,
    ):
        self.startup_id = startup_id
        self.industry = industry
        self.pricing_model = pricing_model
        self.monthly_budget = monthly_budget
        self.category = category

        profile = INDUSTRY_PROFILES.get(industry, INDUSTRY_PROFILES["Other"])
        self.growth_base = profile["growth_base"]
        self.churn_base = profile["churn_base"]
        self.rev_multiple = profile["rev_multiple"]
        self.arpu = PRICING_ARPU.get(pricing_model, 49.0)

    def tick(self, current_state: dict) -> dict:
        """Run a single simulation tick (30-second interval = 1 sim day)."""
        day = current_state.get("simulation_day", 0) + 1
        customers = int(current_state.get("customers", 0))
        mrr = float(current_state.get("mrr", 0))
        funding_raised = float(current_state.get("funding_raised", 0))
        funding_round = current_state.get("funding_round", "pre-seed")
        total_revenue = float(current_state.get("total_revenue", 0))
        investor_interest = float(current_state.get("investor_interest", 0))
        popularity_score = float(current_state.get("popularity_score", 10))

        events = []

        # ── Customer Growth (S-curve + noise) ─────────────────────────────────
        market_saturation = 1 - (customers / max(customers + 5000, 5000))
        budget_boost = min(self.monthly_budget / 10_000, 3.0)
        noise = random.gauss(1.0, 0.15)
        popularity_boost = popularity_score / 100

        daily_growth_rate = (
            self.growth_base * market_saturation * budget_boost * noise * (1 + popularity_boost)
        )

        new_customers = max(0, int(customers * daily_growth_rate + random.randint(1, 10)))
        churn_rate = max(0.01, min(0.30, self.churn_base + random.gauss(0, 0.01)))
        churned = int(customers * churn_rate)
        customers = max(0, customers + new_customers - churned)

        # ── Revenue ────────────────────────────────────────────────────────────
        conversion_rate = {"freemium": 0.04, "subscription": 0.15, "one-time": 0.06,
                           "usage-based": 0.20, "marketplace": 0.08}.get(self.pricing_model, 0.10)
        paying_customers = int(customers * conversion_rate)
        mrr = paying_customers * self.arpu
        arr = mrr * 12
        total_revenue += mrr / 30  # daily revenue portion

        # ── Burn Rate & Runway ─────────────────────────────────────────────────
        burn_rate = self.monthly_budget * random.uniform(0.85, 1.15)
        cash = self.monthly_budget * 12 + funding_raised - (day * burn_rate / 30)
        runway_months = max(0, int(cash / burn_rate)) if burn_rate > 0 else 24

        # ── Popularity & Virality Events ───────────────────────────────────────
        popularity_score = min(100, popularity_score + random.uniform(-1, 2))

        # ── Investor Interest ──────────────────────────────────────────────────
        momentum = (new_customers - churned) / max(customers, 1)
        investor_interest = min(100, max(0, investor_interest + momentum * 20 + random.gauss(0, 2)))

        # ── Valuation ──────────────────────────────────────────────────────────
        valuation = arr * self.rev_multiple * (1 + investor_interest / 200)

        # ── Funding Round Progression ──────────────────────────────────────────
        new_round = self._check_funding_round(arr, funding_round)
        if new_round and new_round != funding_round:
            funding_amount = self._funding_amount(new_round)
            funding_raised += funding_amount
            funding_round = new_round
            events.append({
                "event_type": "funding",
                "title": f"🎉 Raised {new_round.replace('-', ' ').title()} Round!",
                "description": f"Secured ${funding_amount:,.0f} in {new_round} funding. Total raised: ${funding_raised:,.0f}",
                "impact": "positive",
            })

        # ── Random Events ──────────────────────────────────────────────────────
        events.extend(self._generate_random_events(day, customers, new_customers, churned, investor_interest))

        return {
            "startup_id": self.startup_id,
            "day": day,
            "customers": customers,
            "mrr": round(mrr, 2),
            "arr": round(arr, 2),
            "churn_rate": round(churn_rate, 4),
            "valuation": round(valuation, 2),
            "runway_months": runway_months,
            "popularity_score": round(popularity_score, 2),
            "investor_interest": round(investor_interest, 2),
            "funding_raised": round(funding_raised, 2),
            "funding_round": funding_round,
            "total_revenue": round(total_revenue, 2),
            "burn_rate": round(burn_rate, 2),
            "events": events,
        }

    def _check_funding_round(self, arr: float, current_round: str) -> Optional[str]:
        current_idx = FUNDING_ROUNDS.index(current_round) if current_round in FUNDING_ROUNDS else 0
        if current_idx >= len(FUNDING_ROUNDS) - 1:
            return None
        next_round = FUNDING_ROUNDS[current_idx + 1]
        threshold = FUNDING_THRESHOLDS.get(next_round, float("inf"))
        if arr >= threshold and random.random() < 0.15:  # 15% chance per tick when eligible
            return next_round
        return None

    def _funding_amount(self, round_name: str) -> float:
        amounts = {
            "seed": random.uniform(500_000, 2_000_000),
            "series-a": random.uniform(5_000_000, 15_000_000),
            "series-b": random.uniform(20_000_000, 50_000_000),
            "series-c": random.uniform(50_000_000, 150_000_000),
            "ipo": random.uniform(100_000_000, 500_000_000),
        }
        return amounts.get(round_name, 100_000)

    def _generate_random_events(self, day: int, customers: int, new_customers: int,
                                 churned: int, investor_interest: float) -> list:
        events = []
        rand = random.random()

        # Competitor launch
        if rand < 0.03:
            events.append({
                "event_type": "competitor",
                "title": "⚔️ Competitor Launched New Feature",
                "description": "A rival startup just released a feature similar to yours. Churn rate may increase.",
                "impact": "negative",
            })

        # Viral growth spike
        elif rand < 0.06:
            events.append({
                "event_type": "viral",
                "title": "🚀 Viral Growth Spike!",
                "description": f"Your product went viral! +{new_customers * 3} users flooded in from social media.",
                "impact": "positive",
            })

        # Investor interest
        elif rand < 0.09 and investor_interest > 50:
            events.append({
                "event_type": "investor",
                "title": "💼 Investor Showed Interest",
                "description": "A prominent VC reached out requesting a pitch deck and financial projections.",
                "impact": "positive",
            })

        # Press coverage
        elif rand < 0.11:
            events.append({
                "event_type": "press",
                "title": "📰 Featured in TechCrunch",
                "description": "Your startup was mentioned in a top tech publication. Expect a user surge!",
                "impact": "positive",
            })

        # Churn spike
        elif rand < 0.13:
            events.append({
                "event_type": "churn",
                "title": "😟 High Churn Detected",
                "description": f"Unusually high churn this week ({churned} users left). Consider user research.",
                "impact": "negative",
            })

        # Customer milestone
        if customers in [100, 500, 1000, 5000, 10000, 50000, 100000]:
            events.append({
                "event_type": "milestone",
                "title": f"🎯 {customers:,} Customers!",
                "description": f"You've reached {customers:,} total users. Great growth momentum!",
                "impact": "positive",
            })

        return events
