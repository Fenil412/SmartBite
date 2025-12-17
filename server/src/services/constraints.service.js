/**
 * Filter meals using real-world constraints
 */
export const applyConstraints = (meals, constraints) => {
    return meals.filter(meal => {
        // Cooking time
        if (
            constraints.maxCookTime &&
            meal.cookTime > constraints.maxCookTime
        ) {
            return false;
        }

        // Skill level
        const skillRank = {
            beginner: 1,
            intermediate: 2,
            advanced: 3
        };

        if (
            meal.skillLevel &&
            skillRank[meal.skillLevel] > skillRank[constraints.skillLevel]
        ) {
            return false;
        }

        // Appliance check
        if (
            meal.appliances?.length &&
            !meal.appliances.every(a =>
                constraints.appliances.includes(a)
            )
        ) {
            return false;
        }

        return true;
    });
};
