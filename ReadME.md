# Personal Finance Risk Calculator

## What it does
This is a web app I built that tells you how financially risky your situation is. You put in your income, expenses, debt, etc. and it gives you a risk score with some advice on what to do next.

## How I built it
- Frontend: Just HTML, CSS, and JavaScript (no fancy frameworks yet)
- Backend: Python with FastAPI (learning this now)
- Machine Learning: Used scikit-learn to make a model that scores your risk
- The ML model looks at 4 main things:
  - Low risk Probability 0-0.33 percent Your finances are generally stable. Debt and expenses are manageable, liquidity is good, and net worth is positive.
  - Medium risk  0.34 - 0.66 Some areas may be risky. Debt or expenses  might be high, savings moderate, or liquidity limited. Consider adjusting budget or saving more. 
  - High risk - Finances are risky. Debt is high, liquidity low, or net worth negative. Focus on debt reduction, emergency funds, and careful spending.

## Features
- Fill out a form with your financial info
- Get a risk score (Low/Medium/High)
- See some recommendations based on your score
- Works on mobile too

## Running it
1. Clone this repo
```bash
git clone <your-repo-url>
cd FinancialRiskCalculator
```

2. Install stuff
```bash
pip install -r requirements.txt
```

3. Run it
```bash
python main.py
```

## What I learned
This was my first time using FastAPI and machine learning together. Had to figure out how to save the trained model and load it in the API. Also spent way too much time getting the CSS to look decent.

## Future improvements
- Maybe add a database to save user data
- Better UI (probably learn React next)
- More sophisticated ML model