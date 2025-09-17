const resultsContainer = document.getElementById('resultsContainer');

resultsContainer.style.display = 'none'; // hide initially

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('riskForm');
    const scoreDisplay = document.getElementById('scoreDisplay');
    const riskLevel = document.getElementById('riskLevel');
    const recommendationsList = document.getElementById('recommendationsList');
    const resultsContainer = document.getElementById('resultsContainer');

    const debtEl = document.getElementById('debtToIncome');
    const emergencyEl = document.getElementById('emergencyFundCoverage');
    const expenseEl = document.getElementById('expenseToIncome');
    const employmentEl = document.getElementById('employmentStability');

    resultsContainer.style.display = 'none';

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const income = parseFloat(document.getElementById('monthlyIncome').value);
        const expenses = parseFloat(document.getElementById('monthlyExpenses').value);
        const debt = parseFloat(document.getElementById('totalDebt').value);
        const assets = parseFloat(document.getElementById('emergencyFund').value);
        const cash = parseFloat(document.getElementById('emergencyFund').value);
        const employmentType = document.getElementById('employmentType').value;

        // Validate inputs
        if (isNaN(income) || income <= 0) {
            alert("Please enter a valid monthly income greater than 0.");
            return;
        }
        if (isNaN(expenses) || expenses < 0) {
            alert("Please enter a valid monthly expense (0 or greater).");
            return;
        }

        // Calculate financial breakdown values
        const expenseToIncomeRatio = (expenses / income * 100).toFixed(1) + "%";
        debtEl.textContent = (debt / (income * 12) * 100).toFixed(1) + "%";
        emergencyEl.textContent = (cash / expenses).toFixed(1) + " months";
        expenseEl.textContent = expenseToIncomeRatio;
        // Capitalize employment stability output
        employmentEl.textContent = employmentType.charAt(0).toUpperCase() + employmentType.slice(1);

        // Log payload for debugging
        console.log("Payload:", { income, expenses, debt, assets, cash, employmentType });

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

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            console.log("Backend response:", data);

            // Show results container
            resultsContainer.style.display = 'block';

            // Update main score
            const prob = data.probability_risk;
            scoreDisplay.textContent = (prob * 100).toFixed(1) + "%";

            // Determine risk level
            if (prob < 0.33) {
                riskLevel.textContent = "Low Risk";
                riskLevel.className = 'risk-level risk-low';
            } else if (prob < 0.66) {
                riskLevel.textContent = "Medium Risk";
                riskLevel.className = 'risk-level risk-medium';
            } else {
                riskLevel.textContent = "High Risk";
                riskLevel.className = 'risk-level risk-high';
            }

            // Recommendations
            recommendationsList.innerHTML = "";

            const addRecommendation = (text) => {
                const li = document.createElement('li');
                li.textContent = text;
                recommendationsList.appendChild(li);
            };

            if (prob < 0.33) {
                addRecommendation("Maintain your emergency fund and keep saving consistently.");
                addRecommendation("Continue reducing debt to increase financial stability.");
                addRecommendation("Invest surplus cash to grow your assets.");
                addRecommendation("Review expenses quarterly to maintain low risk.");
            } else if (prob < 0.66) {
                if (data.features.debt_to_income > 0.4) addRecommendation("Reduce debt to lower your risk.");
                if (data.features.liquidity_ratio < 3) addRecommendation("Increase emergency fund to cover at least 3 months of expenses.");
                if (data.features.expense_to_income > 0.5) addRecommendation("Trim discretionary spending to improve savings.");
                addRecommendation("Track monthly income and expenses closely.");
            } else {
                addRecommendation("Focus on aggressively reducing high-interest debt.");
                addRecommendation("Build emergency fund to cover 3+ months of expenses immediately.");
                addRecommendation("Review and reduce non-essential expenses.");
                addRecommendation("Consider financial counseling or planning services.");
            }

        } catch (err) {
            console.error("Error calling API:", err);
            scoreDisplay.textContent = "Error";
            riskLevel.textContent = "N/A";
        }
    });
});

// Function to calculate Expense-to-Income Ratio
function calculateExpenseToIncomeRatio(expenses, income) {
    if (income <= 0) {
        return "Income must be greater than 0";
    }
    const ratio = (expenses / income) * 100;
    return ratio.toFixed(1) + "%";
}

// Example usage:
// const ratio = calculateExpenseToIncomeRatio(2000, 5000);
// console.log(ratio);
