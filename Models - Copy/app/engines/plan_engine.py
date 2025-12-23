from ortools.linear_solver import pywraplp

def build_weekly_plan(meals: list, target_calories: int):
    solver = pywraplp.Solver.CreateSolver("SCIP")
    if not solver:
        return meals[:7]

    x = {}

    for i in range(len(meals)):
        x[i] = solver.IntVar(0, 1, f"x_{i}")

    solver.Add(
        sum(x[i] * meals[i]["nutrition"]["calories"] for i in x)
        >= target_calories * 7 * 0.9
    )

    solver.Maximize(sum(x[i] for i in x))
    solver.Solve()

    return [meals[i] for i in x if x[i].solution_value() == 1]
