# src/app.py
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional

# ------------------------------
# FastAPI app
# ------------------------------
app = FastAPI(title="Financial Risk Calculator API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ------------------------------
# Request & Response Models
# ------------------------------
class ScoreRequest(BaseModel):
    income_monthly: float = Field(..., gt=0)
    monthly_expenses: float = Field(..., ge=0)
    total_debt: float = Field(..., ge=0)
    assets: float = Field(..., ge=0)
    cash: float = Field(..., ge=0)
    age: Optional[int] = None
    dependents: Optional[int] = 0

class ScoreResponse(BaseModel):
    risk_score: str
    probability_risk: float
    features: dict
    recommendations: list
    message: Optional[str] = "OK"

# ------------------------------
# Endpoint
# ------------------------------
@app.post("/score", response_model=ScoreResponse)
def calculate_risk(req: ScoreRequest):
    try:
        # ------------------------------
        # Core financial ratios
        # ------------------------------
        debt_to_income = req.total_debt / (req.income_monthly * 12) if req.income_monthly else 0
        expense_ratio = req.monthly_expenses / req.income_monthly if req.income_monthly else 0
        liquidity_ratio = req.cash / req.monthly_expenses if req.monthly_expenses else 0
        net_worth = req.assets - req.total_debt
        savings_rate = (req.income_monthly - req.monthly_expenses) / req.income_monthly if req.income_monthly else 0

        # ------------------------------
        # Compute risk score
        # ------------------------------
        score = 0
        score += 3 if debt_to_income > 0.4 else 0
        score += 3 if expense_ratio > 0.8 else 0
        score += 3 if liquidity_ratio < 3 else 0
        score += 1 if net_worth < 0 else 0

        if score <= 2:
            risk_score = "Low Risk"
            probability_risk = 0.15
        elif score <= 5:
            risk_score = "Medium Risk"
            probability_risk = 0.5
        else:
            risk_score = "High Risk"
            probability_risk = 0.85

        # ------------------------------
        # Dynamic recommendations
        # ------------------------------
        recommendations = []

        # Debt advice
        if debt_to_income > 0.4:
            recommendations.append(
                f"Your debt-to-income ratio is {debt_to_income:.2f}, which is high. Consider paying off high-interest debts first or consolidating loans."
            )
        elif debt_to_income > 0.2:
            recommendations.append(
                f"Your debt-to-income ratio is {debt_to_income:.2f}. Keep an eye on debt and avoid new loans if possible."
            )

        # Expense advice
        if expense_ratio > 0.8:
            recommendations.append(
                f"You spend {expense_ratio*100:.0f}% of your monthly income. Review your budget to cut unnecessary expenses."
            )
        elif expense_ratio > 0.6:
            recommendations.append(
                f"Your monthly expenses are {expense_ratio*100:.0f}% of your income. You have some flexibility to save more."
            )

        # Liquidity advice
        if liquidity_ratio < 3:
            recommendations.append(
                f"You have {liquidity_ratio:.1f} months of expenses in cash. Aim for at least 3–6 months to handle emergencies."
            )
        elif liquidity_ratio < 6:
            recommendations.append(
                f"Liquidity is decent ({liquidity_ratio:.1f} months of expenses). You might gradually increase cash reserves."
            )

        # Net worth advice
        if net_worth < 0:
            recommendations.append(
                f"Your net worth is negative (${net_worth:.2f}). Focus on debt reduction and building assets."
            )
        elif net_worth < req.income_monthly * 12:
            recommendations.append(
                f"Your net worth is ${net_worth:.2f}. Aim to grow assets faster than debts."
            )

        # Savings rate advice
        if savings_rate < 0.2:
            recommendations.append(
                f"Your savings rate is {savings_rate*100:.0f}%. Consider automating savings to reach 20–30% of your income."
            )
        elif savings_rate < 0.35:
            recommendations.append(
                f"Your savings rate is {savings_rate*100:.0f}%. Keep building it gradually for long-term security."
            )

        if not recommendations:
            recommendations.append("Great financial health! Continue monitoring and growing your wealth.")

        # ------------------------------
        # Features for frontend
        # ------------------------------
        features = {
            "debt_to_income": round(debt_to_income, 2),
            "expense_ratio": round(expense_ratio, 2),
            "liquidity_ratio": round(liquidity_ratio, 2),
            "net_worth": round(net_worth, 2),
            "savings_rate": round(savings_rate, 2)
        }

        return ScoreResponse(
            risk_score=risk_score,
            probability_risk=probability_risk,
            features=features,
            recommendations=recommendations
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
