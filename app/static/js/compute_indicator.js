export class ComputeIndicator{
    constructor(){
    }
    getQuantityInKg(quantity, unit){
        var quantity_in_kg = quantity;
        
        if(unit == 'g'){
            quantity_in_kg = quantity / 1000;
        }
        return quantity_in_kg;
    }
    getValueIndicator(inputQuantity, inputUnit, inputFoodType, indicator, indicators, foods){
        //console.log("getValueIndicator");
        //console.log(inputQuantity, inputUnit, inputFoodType, indicator, indicators, foods);
        var quantity_in_kg = this.getQuantityInKg(inputQuantity, inputUnit)
        var indicatorValueFor1000g = foods[inputFoodType][indicators[indicator]['column']]
        var res = quantity_in_kg*(indicatorValueFor1000g)
        return Math.round(res*100)/100;
    }
    compute(indicators, dataConsumptionFood, foods){
        var keys = Object.keys(indicators)
        var indicatorValues = {}
        keys.forEach((key) => {
            // on parcourt tous les indicateurs pour calculer leurs valeurs
            var res = this.getValueIndicator(dataConsumptionFood.quantity, dataConsumptionFood.unit, dataConsumptionFood.ref_id, key, indicators, foods)
            indicatorValues[key] = res;
        })
        return indicatorValues;
    }
    

}