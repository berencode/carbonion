import { ComputeIndicator } from "./compute_indicator.js";

export class FoodConsumption{
    constructor(dataConsumptionFood, dayConsumptionDetails, isCreated){
        this.dataConsumptionFood = dataConsumptionFood;
        this.foodConsumptionModal = new FoodConsumptionModal(this);
        this.dayConsumptionDetails = dayConsumptionDetails;
        this.foodConsumptionGetDetailsButton = new FoodConsumptionGetDetailsButton(this, this.dayConsumptionDetails.dayConsumption.dayConsumptionManager);
        // on se souvient si l'utilisateur doit d'abord créer la consommation, ou juste la modifier.
        this.isCreated = isCreated;

        this.indicators = this.dayConsumptionDetails.dayConsumption.dayConsumptionManager.indicators;
       
        this.computeIndicatorObject = new ComputeIndicator();
        this.indicatorValues = this.computeIndicatorObject.compute(this.indicators, this.dataConsumptionFood, this.dayConsumptionDetails.dayConsumption.foods);
    }
    delete(){
        // Appel à l'API pour la suppression
        let initObject = {
            method: 'DELETE',
            headers: {
                "Content-Type": "application/json",
            }
        }
        fetch('/api/food_consumption/'+this.dataConsumptionFood.food_consumption_id, initObject)
          .then(response => {
                console.log("button to remove : ", this.dataConsumptionFood.food_consumption_id);
                console.log('.food-consumption-item[food-consumption-id="'+this.dataConsumptionFood.food_consumption_id+'"]');
                var buttonToRemove = document.querySelector('.food-consumption-item[food-consumption-id="'+this.dataConsumptionFood.food_consumption_id+'"]')
                buttonToRemove.remove()

                // On propage l'information de la suppression
                this.dayConsumptionDetails.delete(this)
            }
          )
          .catch(error => console.error(error));
    }
    computeIndicator(){
        this.indicatorValues = this.computeIndicatorObject.compute(this.indicators, this.dataConsumptionFood, this.dayConsumptionDetails.dayConsumption.foods);
    }
    update(){
        this.computeIndicator();
        this.dayConsumptionDetails.update();
        this.foodConsumptionGetDetailsButton.refresh();
    }
    updateIndicator(){
        this.computeIndicator();
        this.foodConsumptionGetDetailsButton.refresh();
    }
}


export class FoodConsumptionModal{
    constructor(foodConsumption){
        //this.dataConsumptionFood = dataConsumptionFood;
        //this.associatedItem = associatedItem;
        this.foodConsumption = foodConsumption;
    }   
    display(){
        var modalTitle = document.querySelector('.modal-title');
        var modalBody = document.querySelector('.modal-body');
        var buttonSaveModal = document.querySelector('#button-save-modal');
        
        // On clone les boutons pour supprimer tous les listeners attachés
        buttonSaveModal.replaceWith(buttonSaveModal.cloneNode(true));

        // Redéfinition
        var buttonSaveModal = document.querySelector('#button-save-modal');

        //modalTitle.innerHTML = this.dataConsumptionFood.food_consumption_id
        var foodTypes = this.foodConsumption.dayConsumptionDetails.dayConsumption.foods
        var options_input_food_type = ``

        for (const [foodId, foodType] of Object.entries(foodTypes)){
            options_input_food_type += `<option ${this.foodConsumption.dataConsumptionFood.ref_id===foodId ? 'selected' : ''} value="${foodId}" class="select-option"> ${foodType['nom_produit']} </option>`
        }
        var meal_types = {
            'breakfast' : {'name' : 'Petit déjeuner', 'rang' : 0},
            'lunch' : {'name' : 'Déjeuner', 'rang' : 1},
            'snack' : {'name' : 'Goûter', 'rang' : 2},
            'dinner' : {'name' : 'Dîner', 'rang' : 3},
            'snacking' : {'name' : 'Grignotage', 'rang' : 4}
        }   
        var options_input_food_meal = ``;

        for (const [meal_type_id, meal_type] of Object.entries(meal_types)){
            options_input_food_meal += `<option ${this.foodConsumption.dataConsumptionFood.meal_type_id === meal_type_id ? 'selected' : ''} value="${meal_type_id}" class="select-option"> ${meal_type['name']} </option>`        
        };
        var currentIndicator = this.foodConsumption.dayConsumptionDetails.dayConsumption.dayConsumptionManager.currentIndicator;
        var indicators = this.foodConsumption.dayConsumptionDetails.dayConsumption.dayConsumptionManager.indicators;
        var modalBodyContent = `
            <div class = 'modalContent'>
                <div class="row g-3">
                    <div class="col-12">
                        <label for="input-food-type" class="form-label">Aliment</label>
                        <select class="chosen-select" id="input-food-type" data-width="100%" >
                            ${options_input_food_type}
                        </select>
                    </div>

                    <div class="col-md-6 mb-3">
                        <label for="input-quantity" class="form-label">Quantité</label>
                        <input type="number" class="form-control" id="input-quantity" placeholder="30" min="0" required value="${this.foodConsumption.dataConsumptionFood.quantity}">
                    </div>
                    <div class="col-6">
                        <label for="input-unit" class="form-label">Unité</label>
                        <select class="chosen-select" id="input-unit" data-style="select-option">
                            <option selected> g </option>
                        </select>
                    </div>
                    <div class="col-12">
                        <div class='container-carbon-footprint'>
                            <p class='quantity-carbon-footprint'> ${this.foodConsumption.indicatorValues[currentIndicator]}  </p>
                            <p class='unit-carbon-footprint'> ${indicators[currentIndicator]['unit']} </p>
                        </div>
                    </div>
                    <div class="col-12">
                        <label for="input-meal-type" class="form-label"> Repas </label>
                        <select class="chosen-select" id="input-meal-type" data-width="100%" data-live-search="true" data-style="select-option"  header="true">
                            ${options_input_food_meal}
                        </select>
                    </div>
                    <div class="col-md-6">
                        <label for="input-color" class="form-label" required>Couleur</label>
                        <input type="color" class="form-control" id="input-color" value="${this.foodConsumption.dataConsumptionFood.color}" required>
                    </div>
                    <div class="col-md-6">
                        <label for="input-comment" class="form-label" >Commentaire</label>
                        <input type="text" class="form-control" id="input-comment" value="${this.foodConsumption.dataConsumptionFood.comment}" >
                    </div>
                    
                </div>
            </div>
        `
        var newModalBody = new DOMParser().parseFromString(modalBodyContent, 'text/html').childNodes[0].childNodes[1].childNodes[0];
        modalBody.replaceChildren(newModalBody);

        //$('.chosen-select').chosen({width: "100%"});

        /* MISE EN PLACE DES DIFFÉRENTS ÉVÊNEMENTS LIÉS AU MODAL*/
        var inputQuantity = modalBody.querySelector("#input-quantity");

        inputQuantity.addEventListener(
            "input",
            this.onRefreshValues.bind(this)
        );


        // Soumission du formulaire de modification de la consommation d'aliments
        buttonSaveModal.addEventListener(
            "click",
            this.onSave.bind(this)
        );
        
        //$('select').selectpicker();
        $('#foodConsumption').modal('show');


        $('#input-food-type').select2({
            dropdownParent: $("#foodConsumption"),
            placeholderOption: 'first'
        });
        $('#input-unit').select2({
            dropdownParent: $("#foodConsumption"),
            placeholderOption: 'first'
        });
        $('#input-meal-type').select2({
            dropdownParent: $("#foodConsumption"),
            placeholderOption: 'first'
        });


        $('#input-unit').on('select2:select', 
            this.onRefreshValues.bind(this)
        );

        $('#input-food-type').on('select2:select', 
            this.onRefreshValues.bind(this)
        );
    }

    onRefreshValues(){
        // Sélection des différentes valeurs
        var inputQuantity = document.querySelector("#input-quantity");
        var inputUnit = document.querySelector("#input-unit");
        var inputFoodType = document.querySelector("#input-food-type");

        // Récupération des données utiles pour calculer la valeur de l'indicateur
        var indicators = this.foodConsumption.dayConsumptionDetails.dayConsumption.dayConsumptionManager.indicators;
        var foods = this.foodConsumption.dayConsumptionDetails.dayConsumption.foods

        var currentIndicator = this.foodConsumption.dayConsumptionDetails.dayConsumption.dayConsumptionManager.currentIndicator;
        var newIndicatorValue = this.foodConsumption.computeIndicatorObject.getValueIndicator(inputQuantity.value, inputUnit.value, inputFoodType.value, currentIndicator, indicators, foods);

        var quantityIndicator = document.querySelector('.quantity-carbon-footprint');
        quantityIndicator.innerHTML = newIndicatorValue;

        this.refreshColor();
    }
    refreshColor(){
        var colorField = document.querySelector('#input-color');
        var foodType = document.querySelector("#input-food-type").value;
        colorField.setAttribute('value', this.getRefentialColor(foodType));
    }

    onSave(){
        var data = {};

        // Construction des données pour les inputs classiques
        var inputs = document.forms["form-food-consumption"].getElementsByTagName("input");
        for (var i = 0; i <  inputs.length; i++) {
            var input = inputs[i]
            var id = input.id;
            data[id] = {
                'value' : input.value,
                'required' : input.required,
                'type' : input.type,
            }
        };

        // Construction des données pour les inputs de type select
        var selects = document.forms["form-food-consumption"].getElementsByTagName("select");
        for (var i = 0; i <  selects.length; i++) {
            var select = selects[i];
            var id = select.id;
            data[id] = {
                'value' : select.value,
                'required' : select.required,
                'type' : select.type,
            }
        };

        var listVerif = this.verifData(data);
        var testData = listVerif[0];
        var status = listVerif[1];

        
        if(testData){
            /* Si les données ont passé tous les tests requis on passe à l'enregistrement des données*/
            this.close()
            if(this.foodConsumption.isCreated){
                this.updateFoodConsumption(data)
            }
            else{
                //data['day_consumption_id'] = this.foodConsumption.dayConsumptionDetails.dayConsumptionId
                this.createFoodConsumption(data);
            }
            
        }
        else{
            /* Sinon on doit mettre à jour le modal et afficher les erreurs */
            var form = document.querySelector('#form-food-consumption');
            for (const [key, info] of Object.entries(status)) {
                var errorField = form.querySelector('#'+key);
                var errorText = form.querySelector('#invalid-'+key)
                if (!info['isOk']){    
                    errorField.classList.add("invalid-box");
                    errorText.style.display = "block";
                    errorText.innerHTML = info['text'];
                }
                else {
                    errorField.classList.remove("invalid-box");
                    if(errorText != null){
                        errorText.style.display = "none";
                    }
                }
                
            };            

        }

    }
    close(){
        $('#foodConsumption').modal('hide')
    }
    verifData(data){
        var isOk = true;
        var status = {};
        for (const [key, info] of Object.entries(data)) {

            if(info.value == "" && info.required){
                status[key] = {
                    "isOk" : false,
                    "text" : "Champ obligatoire"
                };
                isOk = false
            }
            else{
                status[key] = {
                    "isOk" : true,
                    "text" : ""
                };
            }
            
        }

        return [isOk, status]
    }

    createFoodConsumption(data){

        var newContent = {
            "color": data['input-color']['value'],
            "quantity": Number(data['input-quantity']['value']),
            "ref_id": data['input-food-type']['value'],
            "unit": data['input-unit']['value'],
            "meal_type_id" : data['input-meal-type']['value'],
            "comment" : data['input-comment']['value'],
            //"carbon_footprint" : this.getQuantityCarbonFootPrint(data['input-quantity']['value'], data['input-unit']['value'], data['input-food-type']['value']),
            "day_consumption_id" : this.foodConsumption.dayConsumptionDetails.dayConsumptionId
        }

        let initObject = {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(newContent)
        }
        fetch('/api/food_consumption', initObject)
          .then(response => 
            response.json()
          )
          .then((dataConsumptionFood) => {        
            
                // mise à jour des données du modal
                this.foodConsumption.dataConsumptionFood = dataConsumptionFood

                // mise à jour des données du bouton pour obtenir les détails de la consommation
                //this.foodConsumption.foodConsumptionGetDetailsButton.dataConsumptionFood = dataConsumptionFood

                /* Ajout de la consommation à la liste */
                var listFoodConsumptions = document.querySelector('.food-consumption-list');
                //this.foodConsumption.dayConsumptionDetails.dataConsumptionFoods.push(dataConsumptionFood);
                listFoodConsumptions.appendChild(
                  this.foodConsumption.foodConsumptionGetDetailsButton.getHtmlRender()
                );

                // Lorsqu'on ouvre le modal de modification, on ne veut plus créer une nouvelle consommation
                this.foodConsumption.isCreated = true;

                this.foodConsumption.dayConsumptionDetails.foodConsumptions.push(this.foodConsumption);

                // on propage les mises à jour dayConsumptionDetails (chart + resumeIndicators)
                this.foodConsumption.update();
              }
          )
          .catch(error => console.error(error));
    
    
    }

    updateFoodConsumption(data){    
        var newContent = {
            "color": data['input-color']['value'],
            "food_consumption_id": this.foodConsumption.dataConsumptionFood.food_consumption_id,
            "quantity": Number(data['input-quantity']['value']),
            "ref_id": data['input-food-type']['value'],
            "unit": data['input-unit']['value'],
            "meal_type_id" : data['input-meal-type']['value'],
            "comment" : data['input-comment']['value'],
            //"carbon_footprint" : this.getQuantityCarbonFootPrint(data['input-quantity']['value'], data['input-unit']['value'], data['input-food-type']['value'])
        }

        let initObject = {
            method: 'PUT',
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(newContent)
        }
        fetch('/api/food_consumption/'+this.foodConsumption.dataConsumptionFood.food_consumption_id, initObject)
          .then(response => 
            response.json()
          )
          .then((dataConsumptionFood) => {
                this.foodConsumption.dataConsumptionFood = dataConsumptionFood
                //this.foodConsumption.foodConsumptionModal.dataConsumptionFood = dataConsumptionFood
                this.foodConsumption.update();
              }
          )
          .catch(error => console.error(error));
    }

    getRefentialColor(foodType){
        var foods = this.foodConsumption.dayConsumptionDetails.dayConsumption.foods
        return foods[foodType]['groupe_aliment_color']
    }
}

export class FoodConsumptionGetDetailsButton{
    constructor(foodConsumption, dayConsumptionManager){
        //this.dataConsumptionFood = dataConsumptionFood
        // Attention : foodConsumption peut être un FoodConsumption ou un FoodConsumptionSelect
        this.foodConsumption = foodConsumption;
        this.dayConsumptionManager = dayConsumptionManager;
    }
    onClick(){
        this.foodConsumption.foodConsumptionModal.display()
    }
    select(){
        this.refresh();
    }
    refresh(){
        var newRender = this.getHtmlRender()
        document.querySelector('div[food-consumption-id = "'+this.foodConsumption.dataConsumptionFood.food_consumption_id+'"][class="food-item-container"]').replaceWith(
            newRender.firstElementChild
        );

        feather.replace();
    }
    getHtmlRender(){
        const res = document.createElement("div");
        var foodTypes = this.dayConsumptionManager.foods;

        var logoCheck =  this.foodConsumption.isSelected===true ? 'check-circle' : 'circle'
        var currentIndicator = this.foodConsumption.dayConsumptionDetails.dayConsumption.dayConsumptionManager.currentIndicator;
        var indicators = this.foodConsumption.dayConsumptionDetails.dayConsumption.dayConsumptionManager.indicators;
        res.classList.add('food-consumption-item');
        res.setAttribute("food-consumption-id", this.foodConsumption.dataConsumptionFood.food_consumption_id);
        res.innerHTML = `
            <div class="food-item-container" food-consumption-id = '${this.foodConsumption.dataConsumptionFood.food_consumption_id}'>
                <button type="button" class="food-item-trash-container" id="delete-food-item" style="display:none">   
                    <div>
                        <i data-feather="trash-2" color="red"></i> 
                    </div>
                </button>
                <button type="button" data-bs-toggle="modal" data-bs-target="#foodConsumption" class='button-get-details-food-consumption' food-consumption-id = '${this.foodConsumption.dataConsumptionFood.food_consumption_id}'> 
                        <div class = "food">
                            
                            <div class = "food-item-first-column">
                                <rect class="rect-color" style="background-color:${this.foodConsumption.dataConsumptionFood.color}">
                            </div>
                            <div class = "food-item-column-extanded">
                                ${foodTypes[this.foodConsumption.dataConsumptionFood.ref_id]['nom_produit']}
                            </div>
                            <div class = "food-item-column">
                                ${this.foodConsumption.dataConsumptionFood.quantity} ${this.foodConsumption.dataConsumptionFood.unit}
                            </div>
                            <div class = "food-item-column">
                                <span class="badge rounded-pill text-bg-light">${this.foodConsumption.indicatorValues[currentIndicator]}</span>
                                <span class="food-item-unit""> ${indicators[currentIndicator]['unit']}</span>

                            </div>
                        </div>
                </button>
            </div>
        `;     
        
        /* Ajout du listener sur le bouton principal*/
        res.querySelector('.button-get-details-food-consumption').addEventListener(
            "click",
            this.onClick.bind(this)
        );
        /* Ajout du listener sur le bouton supprimer l'item*/
        res.querySelector('#delete-food-item').addEventListener(
            "click",
            this.onDelete.bind(this)
        );

        return res
    }
    onDelete(){
        this.foodConsumption.delete()
    }
    onSelect(){
        // On envoie l'information au parent
        this.foodConsumption.select()
    }
}




export class FoodConsumptionSelect{
    constructor(modalImport, dataConsumptionFood){
        this.modalImport = modalImport;
        this.dataConsumptionFood = dataConsumptionFood;
        this.foodConsumptionGetDetailsButton = new FoodConsumptionSelectGetDetailsButton(this, dataConsumptionFood);
        this.isSelected = false;
        //this.dayConsumptionDetails = new DayConsumptionDetails(this.dayConsumptionId, this.date, this.userId);
    }
    update(){
        this.modalImport.update();
    }
    select(){
        // Mise à jour de l'information
        this.isSelected = !this.isSelected;

        // Mise à jour graphique
        this.foodConsumptionGetDetailsButton.select();

        // Envoi de l'information au modal d'import
        this.modalImport.updateSelection(this.dataConsumptionFood.food_consumption_id);
    }
}


export class FoodConsumptionSelectGetDetailsButton{
    constructor(foodConsumptionSelect, dataConsumptionFood){
        this.foodConsumptionSelect = foodConsumptionSelect;
        this.dataConsumptionFood = dataConsumptionFood;
        this.foodConsumption = null;
    }
    select(){
        this.refresh();
    }
    refresh(){
        console.log("refresh");
        var newRender = this.getHtmlRender();
        console.log(newRender);
        console.log(this.foodConsumption.dataConsumptionFood.food_consumption_id);
        document.querySelector('div[food-consumption-id = "'+this.foodConsumption.dataConsumptionFood.food_consumption_id+'"][class="food-item-container"]').replaceWith(
            newRender.firstElementChild
        );
        feather.replace();
    }
    getHtmlRender(){
        const res = document.createElement("div");
        var dayConsumption = this.foodConsumptionSelect.modalImport.dayConsumptionDetails.dayConsumption;
        var foodTypes = dayConsumption.dayConsumptionManager.foods;

        this.foodConsumption = new FoodConsumption(this.dataConsumptionFood, this.foodConsumptionSelect.modalImport.dayConsumptionDetails, true);
        var logoCheck =  this.foodConsumptionSelect.isSelected===true ? 'check-circle' : 'circle'
        var currentIndicator = dayConsumption.dayConsumptionManager.currentIndicator;

        res.classList.add('food-consumption-item');
        res.setAttribute("food-consumption-id",  this.foodConsumption.dataConsumptionFood.food_consumption_id);
        res.innerHTML = `
            <div type="button" class="food-item-container" id="select-food-item" food-consumption-id = '${this.foodConsumption.dataConsumptionFood.food_consumption_id}'>
                <div type="button" class = "food-item-select-container" >   
                    <div>
                        <i data-feather="${logoCheck}" color="white"></i> 
                    </div>
                </div>
                <div class='get-details-food-consumption' food-consumption-id = '${ this.foodConsumption.dataConsumptionFood.food_consumption_id}'> 
                        <div class = "food">
                            
                            <div class = "food-item-first-column">
                                <rect class="rect-color" style="background-color:${ this.foodConsumption.dataConsumptionFood.color}">
                            </div>
                            <div class = "food-item-column-extanded">
                                ${foodTypes[ this.foodConsumption.dataConsumptionFood.ref_id]['nom_produit']}
                            </div>
                            <div class = "food-item-column">
                                ${ this.foodConsumption.dataConsumptionFood.quantity} ${ this.foodConsumption.dataConsumptionFood.unit}
                            </div>
                            <div class = "food-item-column">
                                <span class="badge rounded-pill text-bg-light">${ this.foodConsumption.indicatorValues[currentIndicator]}</span>
                            
                            </div>
                        </div>
                </div>
            </div>
        `;     

        /* Ajout du listener sur le bouton selectionner */
        res.querySelector('#select-food-item').addEventListener(
            "click",
            this.onSelect.bind(this)
        );



        return res
    }
    onDelete(){
        this.foodConsumption.delete()
    }
    onSelect(){
        // On envoie l'information au parent
        this.foodConsumptionSelect.select()
    }
}