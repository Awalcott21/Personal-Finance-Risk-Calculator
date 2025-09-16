const form = document.getElementById('riskForm');
const scoreDisplay = document.getElementById('scoreDisplay');
const riskLevel = document.getElementById('riskLevel');
const recommendationsList = document.getElementById('recommendationsList');
const resultsContainer = document.getElementById('resultsContainer');

resultsContainer.style.display = 'none'; // hide initially

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Collect input values
    const income = parseFloat(document.getElementById('monthlyIncome').value);
    const expenses = parseFloat(document.getElementById('monthlyExpenses').value);
    const debt = parseFloat(document.getElementById('totalDebt').value);
    const assets = parseFloat(document.getElementById('emergencyFund').value);
    const cash = parseFloat(document.getElementById('emergencyFund').value);

    // Build payload
    const payload = {
        income_monthly: income,
        monthly_expenses: expenses,
        total_debt: debt,
        assets: assets,
        cash: cash,
        avg_monthly_return: 0,
        std_monthly_return: 0,
        portfolio_returns: [0]
    };

    try {
        const response = await fetch("http://127.0.0.1:8000/score", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        const score = data.probability_risk; // 0-1

        // Update score display as percentage
        scoreDisplay.textContent = (score * 100).toFixed(1) + "%";

        // Update risk level
        if (score < 0.33) {
            riskLevel.textContent = "Low Risk";
            riskLevel.className = "risk-level risk-low";
        } else if (score < 0.66) {
            riskLevel.textContent = "Medium Risk";
            riskLevel.className = "risk-level risk-medium";
        } else {
            riskLevel.textContent = "High Risk";
            riskLevel.className = "risk-level risk-high";
        }

        // Populate recommendations
        recommendationsList.innerHTML = "";
        const features = data.features;

        if (features.liquidity_ratio !== undefined && features.liquidity_ratio < 3) {
            recommendationsList.innerHTML += "<li>Increase cash or liquid assets for 3+ months of expenses</li>";
        }
        if (features.debt_to_income !== undefined && features.debt_to_income > 0.4) {
            recommendationsList.innerHTML += "<li>Reduce debt or consider consolidation</li>";
        }
        if (features.savings_rate !== undefined && features.savings_rate < 0.2) {
            recommendationsList.innerHTML += "<li>Increase monthly savings rate</li>";
        }
        if (features.net_worth !== undefined && features.net_worth < 0) {
            recommendationsList.innerHTML += "<li>Work on increasing net worth</li>";
        }
        if (recommendationsList.innerHTML === "") {
            recommendationsList.innerHTML = "<li>Great financial health! Keep it up.</li>";
        }

        // Show results container
        resultsContainer.style.display = "block";
        resultsContainer.scrollIntoView({ behavior: 'smooth' });

    } catch (err) {
        console.error("Error calling API:", err);
        scoreDisplay.textContent = "Error";
        riskLevel.textContent = "N/A";
        recommendationsList.innerHTML = "<li>Unable to fetch recommendations</li>";
        resultsContainer.style.display = "block";
    }
});
