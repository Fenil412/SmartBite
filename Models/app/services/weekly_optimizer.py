def optimize_week(calorie_target: float):
    try:
        from pulp import (
            LpProblem,
            LpMinimize,
            LpVariable,
            lpSum
        )
    except ImportError:
        # Fallback to simple distribution if pulp is not available
        return [calorie_target] * 7
    
    prob = LpProblem("WeeklyCalories", LpMinimize)

    days = range(7)

    # Calories per day
    cal = LpVariable.dicts("cal", days, lowBound=0)

    # Absolute deviation variables
    dev_pos = LpVariable.dicts("dev_pos", days, lowBound=0)
    dev_neg = LpVariable.dicts("dev_neg", days, lowBound=0)

    # Objective: minimize total deviation
    prob += lpSum(dev_pos[d] + dev_neg[d] for d in days)

    for d in days:
        # cal[d] - target = dev_pos - dev_neg
        prob += cal[d] - calorie_target == dev_pos[d] - dev_neg[d]

        # Safety bounds (±5%)
        prob += cal[d] >= calorie_target * 0.95
        prob += cal[d] <= calorie_target * 1.05

    prob.solve()

    return [round(cal[d].value(), 1) for d in days]
