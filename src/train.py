# src/train.py
import joblib
import pandas as pd
import numpy as np
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LogisticRegression
from .features import FinancialFeatureEngineer
from .preprocess import build_preprocessor
from .ingest import simulate_market_returns, read_users_from_csv

# --- Load data (replace with real path) ---
# raw = read_users_from_csv("data/raw_users.csv")
# For demo: create synthetic dataset (you should replace with real labelled dataset)
def synthetic_dataset(n=200, seed=1):
    rng = np.random.default_rng(seed)
    market = simulate_market_returns(24)
    rows = []
    for i in range(n):
        income = int(rng.integers(3000, 15000))
        expenses = int(income * rng.uniform(0.4, 0.9))
        debt = int(rng.integers(0, 100000))
        assets = int(rng.integers(1000, 300000))
        cash = int(rng.integers(0, min(assets, 50000)))
        # create fake returns summary
        avg = rng.normal(0.01, 0.03)
        std = abs(rng.normal(0.03, 0.01))
        rows.append({
            "income_monthly": income,
            "monthly_expenses": expenses,
            "total_debt": debt,
            "assets": assets,
            "cash": cash,
            "avg_monthly_return": avg,
            "std_monthly_return": std,
            "portfolio_returns": (rng.uniform(-0.05,0.05, size=market.size) + 0.5*market)
        })
    df = pd.DataFrame(rows)
    # make a toy label: high risk if debt_to_income > 3 or net_worth < 0
    fe = FinancialFeatureEngineer(market_returns=market)
    eng = fe.transform(df)
    y = ((eng["debt_to_income"] > 3) | (eng["net_worth"] < 0)).astype(int)
    return df, y, market

if __name__ == "__main__":
    raw, y, market = synthetic_dataset(500)
    fe = FinancialFeatureEngineer(market_returns=market)
    numeric_features = ["debt_to_income","liquidity_ratio","net_worth","savings_rate","volatility_annualized","sharpe_approx","beta","annual_return"]
    pre = build_preprocessor(numeric_features)
    # pipeline: feature engineer -> preprocessor -> model
    pipe = Pipeline([
        ("fe", fe),
        ("pre", pre),
        ("clf", LogisticRegression(max_iter=1000))
    ])
    pipe.fit(raw, y)
    # persist
    joblib.dump(pipe, "models/pipeline.pkl")
    print("Saved pipeline to models/pipeline.pkl")
