

export class DataGenerator{
    constructor(){
    }

    getMean(data, key, nbJour) {
        if (data.length === 0) {
            return 0; // Return 0 if the array is empty to avoid division by zero
        }
    
        // Calculate the sum of carbon_footprint values
        const sum = data.reduce((acc, item) => acc + parseFloat(item[key]), 0);
    
        // Calculate the mean by dividing the sum by the number of items
        const mean = sum / nbJour;
        
        return mean.toFixed(4);
    }

    getSum(data, key) {
        const sum = data.reduce((acc, item) => acc + parseFloat(item[key]), 0);
        
        return sum.toFixed(2);
    }

    getFootPrintEvolutionMealType(dayConsumptions, foodConsumptions, foods, indicatorValues, currentIndicator){
        let mealTypeData = {};
        const mealTypes = {
            'breakfast' : {'label' : 'Petit-déjeuner'}, 
            'lunch' : {'label' : 'Déjeuner'}, 
            'snack' : {'label' : 'Goûter'}, 
            'dinner' : {'label' : 'Diner'},
            'snacking' : {'label' : 'Grignotage'}, 
        };

        Object.keys(mealTypes).forEach((mealTypeId) => {
            const mealType = mealTypes[mealTypeId]
            mealTypeData[mealType['label']] = {};
            dayConsumptions.forEach((dayConsumption) => {
                var day_consumption_id = dayConsumption['day_consumption_id'];
                
                const foodConsumptionsOfMealType = foodConsumptions.filter(
                    (foodConsumption) => (foodConsumption['day_consumption_id'] == day_consumption_id) && (foodConsumption['meal_type_id'] == mealTypeId)
                )
                
                var indicatorValuesOfMealType = []
                // on parcourt toutes les consommations d'aliments
                foodConsumptions.forEach(foodConsumption=>{
                    // on parcourt tous les calculs d'indicateurs pour tous les jours
                    
                    if(foodConsumption['day_consumption_id'] == day_consumption_id && foodConsumption['meal_type_id'] == mealTypeId){
                        indicatorValuesOfMealType.push(indicatorValues[foodConsumption.food_consumption_id])
                    }  
                })

                mealTypeData[mealType['label']][day_consumption_id] = this.getSum(indicatorValuesOfMealType, currentIndicator);
            })
        })

        const resultArray = Object.entries(mealTypeData).map(([name, data]) => ({
            name,
            data: Object.values(data)
        }));

        var categories = []
        // Constitution de la catégories (jours du challenge)
        for(var i = 0; i < dayConsumptions.length; i++){
            categories.push("Jour "+(i+1));
        }

        var res = {
            series : resultArray,
            categories :  categories,
            title : "Évolution par type de repas",
        }

        return res;
    }
    getFootPrintEvolutionFoodType(dayConsumptions, foodConsumptions, foods, indicatorValues, currentIndicator){

        console.log("getFootPrintEvolutionFoodType");
        let foodGroupeAlimentData = {};

        const foodTypes = {}
        // rajout dans le foodConsumptions de l'information du groupe d'aliments : 
        //foods.forEach((food, index) => foodTypes[food.code_agb] = {'label' : food.nom_produit, 'groupe_aliment' : food.groupe_aliment});
        foodConsumptions.forEach((foodConsumption) => {
            foodConsumption['groupe_aliment'] = foods[foodConsumption.ref_id].groupe_aliment
        })


        const foodGroupeAliments = {}
        Object.keys(foods).forEach((index) => foodGroupeAliments[foods[index].groupe_aliment] = {'label' : foods[index].groupe_aliment.substring(0,15)});

        Object.keys(foodGroupeAliments).forEach((foodGroupeAlimentId) => {
            const foodGroupeAliment = foodGroupeAliments[foodGroupeAlimentId]
            foodGroupeAlimentData[foodGroupeAliment['label']] = {};
            dayConsumptions.forEach((dayConsumption) => {
                var day_consumption_id = dayConsumption['day_consumption_id'];
                var indicatorValuesOfMealType = []
                // on parcourt toutes les consommations d'aliments
                foodConsumptions.forEach(foodConsumption=>{
                    // on parcourt tous les calculs d'indicateurs pour tous les jours
                    if(foodConsumption['day_consumption_id'] == day_consumption_id && foodConsumption['groupe_aliment'] == foodGroupeAlimentId){
                        indicatorValuesOfMealType.push(indicatorValues[foodConsumption.food_consumption_id])
                    }  
                })
                foodGroupeAlimentData[foodGroupeAliment['label']][day_consumption_id] = this.getSum(indicatorValuesOfMealType, currentIndicator);
            })
        })


        var categories = []
        // Constitution de la catégories (jours du challenge)
        for(var i = 0; i < dayConsumptions.length; i++){
            categories.push("Jour "+(i+1));
        }

        const resultArray = Object.entries(foodGroupeAlimentData).map(([name, data]) => ({
            name,
            data: Object.values(data)
        }));
                
        var res = {
            series : resultArray,
            categories :  categories,
            title : "Évolution par type d'aliments",
        }

        return res;
    }
    getFootPrintRepartitionMealType(dayConsumptions, foodConsumptions, foods, indicatorValues, currentIndicator){
        var mean = [];
        var typeData = [];
        const mealTypes = {
            'breakfast' : {'label' : 'Petit-déjeuner'}, 
            'lunch' : {'label' : 'Déjeuner'}, 
            'snack' : {'label' : 'Goûter'}, 
            'dinner' : {'label' : 'Diner'},
            'snacking' : {'label' : 'Grignotage'}, 
        };
        var nbJour = dayConsumptions.length;
        
        


        Object.keys(mealTypes).forEach((mealTypeId) => {
            const mealType = mealTypes[mealTypeId]

            var indicatorValuesOfMealType = []
            // on parcourt toutes les consommations d'aliments
            foodConsumptions.forEach(foodConsumption=>{
                // on parcourt tous les calculs d'indicateurs pour tous les jours
                if(foodConsumption['meal_type_id'] == mealTypeId){
                    indicatorValuesOfMealType.push(indicatorValues[foodConsumption.food_consumption_id])
                }  
            })

            const meanForMealType = parseFloat(this.getMean(indicatorValuesOfMealType, currentIndicator, nbJour));
            mean.push(meanForMealType);
            typeData.push(mealType['label']);

        })

        console.log("MEAN : ", mean);
        console.log(typeData);
        var res = {
            series : mean,
            categories :  typeData,
            title : "Répartition pour une journée moyenne par type de repas",
        }

        return res;
    }


    getFootPrintRepartitionFoodType(dayConsumptions, foodConsumptions, foods, indicatorValues, currentIndicator){
        var mean = [];
        var typeData = [];

        console.log("getFootPrintEvolutionFoodType");

        foodConsumptions.forEach((foodConsumption) => {
            foodConsumption['groupe_aliment'] = foods[foodConsumption.ref_id].groupe_aliment
        })

        const foodGroupeAliments = {}
        Object.keys(foods).forEach((index) => foodGroupeAliments[foods[index].groupe_aliment] = {'label' : foods[index].groupe_aliment.substring(0,15)});


        var nbJour = dayConsumptions.length;
        Object.keys(foodGroupeAliments).forEach((foodGroupeAlimentId) => {

            var indicatorValuesOfFoodType = []
            foodConsumptions.forEach(foodConsumption=>{
                // on parcourt tous les calculs d'indicateurs pour tous les jours
                if(foodConsumption['groupe_aliment'] == foodGroupeAlimentId){
                    indicatorValuesOfFoodType.push(indicatorValues[foodConsumption.food_consumption_id])
                }  
            })
            const meanForFoodType = parseFloat(this.getMean(indicatorValuesOfFoodType, currentIndicator, nbJour));
            mean.push(meanForFoodType);
            typeData.push(foodGroupeAlimentId);
        })

        console.log("MEAN : ", mean);
        var categories = []
        // Constitution de la catégories (jours du challenge)
        for(var i = 0; i < dayConsumptions.length; i++){
            categories.push("Jour "+(i+1));
        }

        console.log("MEAN : ", mean);
        console.log(typeData);
        var res = {
            series : mean,
            categories :  typeData,
            title : "Répartition pour une journée moyenne par type de repas"
        }

        return res;

    }
    
}