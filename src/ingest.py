# src/ingest.py
import numpy as np
import pandas as pd

def simulate_market_returns(length=24, seed=42):
    rng = np.random.default_rng(seed)
    return rng.normal(loc=0.01, scale=0.05, size=length)

# Example: read a user table (CSV) or accept a single-user dict (api input)
def read_users_from_csv(path):
    return pd.read_csv(path)

# Convert single JSON input to a one-row DataFrame expected by the pipeline
def single_input_to_df(payload: dict):
    # payload keys should match what your feature-engineer expects:
    # income_monthly, monthly_expenses, total_debt, assets, cash, portfolio_returns (optional)
    df = pd.DataFrame([payload])
    # if portfolio_returns is a list, convert it to a numpy array object column
    if 'portfolio_returns' in df.columns:
        df['portfolio_returns'] = df['portfolio_returns'].apply(lambda x: np.asarray(x) if pd.notna(x) else np.array([]))
    return df
