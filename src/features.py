# src/features.py
import numpy as np
import pandas as pd
from sklearn.base import BaseEstimator, TransformerMixin

class FinancialFeatureEngineer(BaseEstimator, TransformerMixin):
    """
    Input: DataFrame with columns:
      income_monthly, monthly_expenses, total_debt, assets, cash,
      avg_monthly_return, std_monthly_return, portfolio_returns (optional)
    Output: DataFrame with engineered features + user_id if present.
    """
    def __init__(self, market_returns=None, risk_free_annual=0.02):
        self.market_returns = np.asarray(market_returns) if market_returns is not None else None
        self.risk_free_annual = risk_free_annual

    def fit(self, X, y=None):
        return self

    def transform(self, X):
        df = X.copy().reset_index(drop=True)
        # required columns presence can be validated here (or upstream)
        df["annual_income"] = df["income_monthly"] * 12
        df["debt_to_income"] = df["total_debt"] / (df["annual_income"] + 1e-9)
        df["liquidity_ratio"] = df["cash"] / (df["monthly_expenses"] + 1e-9)
        df["net_worth"] = df["assets"] - df["total_debt"]
        df["savings_rate"] = (df["income_monthly"] - df["monthly_expenses"]) / (df["income_monthly"] + 1e-9)
        df["volatility_annualized"] = df.get("std_monthly_return", 0.0) * np.sqrt(12)
        df["annual_return"] = df.get("avg_monthly_return", 0.0) * 12
        df["sharpe_approx"] = (df["annual_return"] - self.risk_free_annual) / (df["volatility_annualized"] + 1e-9)

        # compute beta vs market if timeseries present
        betas = []
        if self.market_returns is not None and "portfolio_returns" in df.columns:
            m = self.market_returns
            m_var = np.var(m)
            for pr in df["portfolio_returns"]:
                pr_arr = np.asarray(pr) if pr is not None else np.array([])
                if pr_arr.size != m.size or pr_arr.size == 0:
                    betas.append(np.nan)
                else:
                    cov = np.cov(pr_arr, m)[0,1]
                    betas.append(cov / (m_var + 1e-12))
        else:
            betas = [np.nan]*len(df)
        df["beta"] = betas

        engineered = df[[
            col for col in [
                "user_id", "debt_to_income", "liquidity_ratio", "net_worth",
                "savings_rate", "volatility_annualized", "sharpe_approx", "beta", "annual_return"
            ] if col in df.columns
        ]].copy()

        return engineered
