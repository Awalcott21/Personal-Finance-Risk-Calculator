document.getElementById('riskForm').addEventListener('submit', function (e) {
    e.preventDefault();
    calculateRisk();
});
console.log("JavaScript file is connected!");
function calculateRisk() {
    // Get form data
    const monthlyIncome = parseFloat(document.getElementById('monthlyIncome').value);
    const monthlyExpenses = parseFloat(document.getElementById('monthlyExpenses').value);
    const totalDebt = parseFloat(document.getElementById('totalDebt').value);
    const emergencyFund = parseFloat(document.getElementById('emergencyFund').value);
    const employmentType = document.getElementById('employmentType').value;
    const age = parseInt(document.getElementById('age').value);
    const dependents = parseInt(document.getElementById('dependents').value);

    // Calculate ratios
    const debtToIncomeRatio = (totalDebt / (monthlyIncome * 12)) * 100;
    const expenseToIncomeRatio = (monthlyExpenses / monthlyIncome) * 100;
    const emergencyFundMonths = emergencyFund / monthlyExpenses;

    // Calculate risk scores (1-10 scale)
    let debtScore = calculateDebtScore(debtToIncomeRatio);
    let emergencyScore = calculateEmergencyScore(emergencyFundMonths);
    let expenseScore = calculateExpenseScore(expenseToIncomeRatio);
    let employmentScore = calculateEmploymentScore(employmentType);

    // Weighted average (30%, 25%, 25%, 20%)
    const totalScore = Math.round(
        (debtScore * 0.30) +
        (emergencyScore * 0.25) +
        (expenseScore * 0.25) +
        (employmentScore * 0.20)
    );

    // Display results
    displayResults(totalScore, debtToIncomeRatio, expenseToIncomeRatio, emergencyFundMonths);
}

function calculateDebtScore(ratio) {
    if (ratio <= 20) return 2;
    if (ratio <= 40) return 5;
    return 8;
}

function calculateEmergencyScore(months) {
    if (months >= 6) return 2;
    if (months >= 3) return 5;
    return 8;
}

function calculateExpenseScore(ratio) {
    if (ratio <= 70) return 2;
    if (ratio <= 90) return 5;
    return 8;
}

function calculateEmploymentScore(type) {
    switch (type) {
        case 'fulltime': return 2;
        case 'parttime': return 5;
        case 'selfemployed': return 6;
        case 'unemployed': return 9;
        default: return 5;
    }
}

function displayResults(score, debtRatio, expenseRatio, emergencyMonths) {
    document.getElementById('scoreDisplay').textContent = score;

    let riskLevel, riskClass;
    if (score <= 3) {
        riskLevel = 'Low Risk';
        riskClass = 'risk-low';
    } else if (score <= 6) {
        riskLevel = 'Medium Risk';
        riskClass = 'risk-medium';
    } else {
        riskLevel = 'High Risk';
        riskClass = 'risk-high';
    }

    const riskLevelElement = document.getElementById('riskLevel');
    riskLevelElement.textContent = riskLevel;
    riskLevelElement.className = `risk-level ${riskClass}`;

    // Generate recommendations
    generateRecommendations(score, debtRatio, expenseRatio, emergencyMonths);

    // Show results
    document.getElementById('resultsContainer').style.display = 'block';
    document.getElementById('resultsContainer').scrollIntoView({ behavior: 'smooth' });
}

function generateRecommendations(score, debtRatio, expenseRatio, emergencyMonths) {
    const recommendations = [];

    if (emergencyMonths < 3) {
        recommendations.push('Build emergency fund to cover 3-6 months of expenses');
    }
    if (debtRatio > 40) {
        recommendations.push('Focus on debt reduction - consider debt consolidation');
    }
    if (expenseRatio > 80) {
        recommendations.push('Review and reduce monthly expenses where possible');
    }
    if (score >= 7) {
        recommendations.push('Consider consulting with a financial advisor');
    }
    if (score <= 3) {
        recommendations.push('Great financial health! Consider investing surplus income');
    }

    const listElement = document.getElementById('recommendationsList');
    listElement.innerHTML = '';
    recommendations.forEach(rec => {
        const li = document.createElement('li');
        li.textContent = rec;
        listElement.appendChild(li);
    });
}