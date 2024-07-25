import { Review } from "./review.js";

export class ChallengeManager{
    constructor(){
      this.daysConsumptions = [];
      this.activateCreateChallengeButton();
      this.loadChallenges();
      this.default_challenge_day_number = 7;
      this.challenges = {};

      this.indicators = null;
      this.currentIndicator = null;
      this.loadIndicators();
    }
    activateCreateChallengeButton(){
        var createChallengeButton = document.querySelector('#challenge-create');
        createChallengeButton.addEventListener(
            "click",
            this.createChallenge.bind(this)
          );
    }
    loadChallenges(){
        // Load de tous les challenges existants
        let initObject = {
            method: 'GET',
            headers: {
                "Content-Type": "application/json",
            },
        }
        
        fetch('/api/challenge', initObject)
            .then(response => 
                    response.json()
            )
            .then((challenges) => {
                // mise à jour de la liste des challenges.
                    challenges.forEach(challenge => {
                        var newChallenge = new Challenge(this, challenge);
                        document.querySelector('.challenge-item-container').appendChild(
                            newChallenge.challengeButton.getHtmlRender()
                        );
                        this.challenges[challenge.challenge_id] = challenge;
                        feather.replace();
                    });
                }
            )
            .catch(error => console.error(error));    
    }
    loadIndicators(){
        /* Permet de charger tous les indicateurs disponibles */
        let initObject = {
            method: 'GET',
            headers: {
                "Content-Type": "application/json",
            },
        }
        fetch('/api/indicator', initObject)
          .then(response => 
                  response.json()
          )
          .then((data) => {
                  var dictionaryById = {};
                  for (var i = 0; i < data.length; i++) {
                    var currentObject = data[i];
                    var id = currentObject.indicator_id;
                    dictionaryById[id] = currentObject;
                  }
                  // stockage du dictionnaire dans la variable indicators
                  this.indicators = dictionaryById;
                  this.currentIndicator = 'carbone';
              }
          )
          .catch(error => console.error(error));
      }
    createChallenge(){
        // Création du challenge via appel à l'API
        let initObject = {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                "day_number": this.default_challenge_day_number,
                "status": 0
            })
        }
        
        fetch('/api/challenge', initObject)
            .then(response => 
                    response.json()
            )
            .then((challenge) => {
                // mise à jour de la liste des challenges.
                    if(Object.keys(challenge).length != 0){
                        // si un nouveau challenge a bien été ajouté
                        var newChallenge = new Challenge(this, challenge);
                        document.querySelector('.challenge-item-container').appendChild(
                            newChallenge.challengeButton.getHtmlRender()
                        )
                        newChallenge.challengeButton.onClick("settings");
                    }
                    else{
                        $('#warningModal').modal('show')
                        //console.log("Pas le droit de créer un nouveau challenge si les précédents ne sont pas terminés !")
                    }
                    
                }
            )
            .catch(error => console.error(error));
    }
}

export class Challenge{
    constructor(parent, dataChallenge){
        this.challengeManager = parent;
        this.dataChallenge = dataChallenge;
        this.challengeButton = new ChallengeButton(this.dataChallenge, this);
        this.challengeDetails = new ChallengeDetails(this.dataChallenge, this);
    }
    updateData(data){
        this.dataChallenge = data;
        this.challengeButton.updateData(data);
        this.challengeDetails.updateData(data);
    }
    delete(){
        // Appel à l'API pour la suppression
        let initObject = {
            method: 'DELETE',
            headers: {
                "Content-Type": "application/json",
            }
        }
        fetch('/api/challenge/'+this.dataChallenge['challenge_id'], initObject)
            .then(response => {
                this.challengeButton.delete();
                this.challengeDetails.delete();
            }
            )
            .catch(error => console.error(error));
    }
}


export class ChallengeButton{
    constructor(dataChallengeButton, parent){
        this.dataChallengeButton = dataChallengeButton;
        this.challenge = parent;
    }
    updateData(data){
        this.dataChallengeButton = data;
        document.querySelector('.challenge-item[challenge-id="'+this.challenge.dataChallenge.challenge_id+'"]').replaceWith(
            this.getHtmlRender()
        );
    }
    delete(){
        document.querySelector('.challenge-item[challenge-id="'+this.challenge.dataChallenge.challenge_id+'"]').remove();
    }
    onClick(mode){
        console.log("onclick");
        // Chargement des données pour les reviews
        let initObject = {
            method: 'GET',
            headers: {
                "Content-Type": "application/json",
            },
        }
        // Chargement de toutes les consommations d'aliments
        const promise1 = fetch('/api/food_consumption', initObject)
                            .then(response => 
                                response.json()
                            )
                            .catch(error => console.error(error));
        
        // Chargement de tous les jours de consommation
        const promise2 = fetch('/api/day_consumption', initObject)
                            .then(response => 
                                response.json()
                            )
                            .catch(error => console.error(error));
        

       
        // Une fois que les consommations d'aliments sont chargées, on charge le détails des aliments considérés
        Promise.all([promise1, promise2]).then(([foodConsumptions, dayConsumptions]) => {
            var foods = [];
            var foodPromises = [];
            foodConsumptions.forEach((foodConsumption)=>{
                const foodPromise = fetch('/api/food/'+foodConsumption.ref_id, initObject)
                .then(response => 
                    response.json()
                )
                .catch(error => console.error(error));
                foodPromises.push(foodPromise);
            })
            
            Promise.all(foodPromises).then((foods)=>{
                const dayConsumptionStudied = dayConsumptions.filter(
                    (dayConsumption) => dayConsumption['challenge_id'] == this.challenge.dataChallenge.challenge_id
                );
                
                const dayConsumptionsIdStudied = dayConsumptionStudied.map((dayConsumption) => dayConsumption['day_consumption_id'])

                const foodConsumptionsStudied = foodConsumptions.filter(
                    (foodConsumption) => dayConsumptionsIdStudied.indexOf(foodConsumption['day_consumption_id']) != -1
                );


                // Sauvegarde dans le challengeDetails
                this.challenge.challengeDetails.foodConsumptions = foodConsumptionsStudied;
                this.challenge.challengeDetails.dayConsumptions = dayConsumptionStudied;


                var dictionaryById = {};
                for (var i = 0; i < foods.length; i++) {
                    var currentObject = foods[i];
                    var id = currentObject.code_agb;
                    dictionaryById[id] = currentObject;
                }
                this.challenge.challengeDetails.foods = dictionaryById;

                console.log("mode :", mode);
                // Affichage du challenge details
                if(mode == "settings"){
                    this.challenge.challengeDetails.display();
                    this.challenge.challengeDetails.openSettings();
                }
                else{
                    //TODO : ATTENTION LE DISPLAY RAJOUTE UN GRAPH À L'ENREGISTREMENT
                    this.challenge.challengeDetails.display();
                }    
            })
        })   
    }
    getHtmlRender(){
        console.log(this.challenge.dataChallenge)
        var logoCheck =  this.challenge.dataChallenge.is_terminated===true ? 'check-circle' : 'circle'
        var res = `
            <button type="button" class="challenge-item" challenge-id=${this.dataChallengeButton.challenge_id}>
                <rect class="rect-color" style="background-color:${this.dataChallengeButton.color}">
                </rect>
                <div class = "challenge-item-column">
                    <div>
                            <span class = "emphasis-info">${this.dataChallengeButton['name']}</span>
                    </div>
                </div>
                <div class = "challenge-item-column">
                    <div>
                            Commencé le 
                            <span class = "emphasis-info"> ${this.dataChallengeButton['date']}</span>
                    </div>
                </div>
                <div class = "challenge-item-column">
                    <div>
                            Pour
                            <span class="emphasis-info"> ${this.dataChallengeButton['day_number']} </span>
                            jours
                    </div>
                </div>
                <div class = "challenge-item-column">
                    <div>
                        <i data-feather="`+logoCheck+`" color="#2ecc71" style="flex:1"></i> 
                    </div>
                </div>
            </button>
          `
        res = new DOMParser().parseFromString(res , 'text/html').childNodes[0].childNodes[1].childNodes[0];

        
        res.addEventListener(
            "click",
            this.onClick.bind(this)
        );

        return res
    }
}

export class ChallengeSettingsForm{
    constructor(parent){
        this.challengeDetails = parent;
    }
    backToReview(){
        this.challengeDetails.getReview();
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
    onDeleteAskConfirmation(){
        $('#deleteChallengeModal').modal('show');
        document.querySelector('#button-delete-challenge-confirmation').addEventListener(
            'click',
            this.onDelete.bind(this)
        );
    }
    onDelete(){
        this.challengeDetails.challenge.delete();
    }
    onSave(){
        var data = {};
        // Construction des données pour les inputs classiques
        var inputs = document.forms["form-challenge-settings"].getElementsByTagName("input");
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
        var selects = document.forms["form-challenge-settings"].getElementsByTagName("select");
        for (var i = 0; i <  selects.length; i++) {
            var select = selects[i];
            var id = select.id;
            console.log(i, id, select.value, select.type)
            data[id] = {
                'value' : select.value,
                'required' : select.required,
                'type' : select.type,
            }
        };

        var listVerif = this.verifData(data)
        var testData = listVerif[0];
        var status = listVerif[1];

        if(testData){
            /* Si les données ont passé tous les tests requis on passe à l'enregistrement des données*/
            this.updateChallenge(data)
        }
        else{
            /* Sinon on doit mettre à jour le modal et afficher les erreurs */
            var form = document.querySelector('#form-challenge-settings');
        }
    }
    updateChallenge(data){
        console.log("updateChallenge ");
        var newContent = {
            "challenge_id": this.challengeDetails.challenge.dataChallenge['challenge_id'],
            "name" : data['input-challenge-name']['value'],
            "day_number": parseInt(data['input-challenge-days-number']['value'])
        }

        let initObject = {
            method: 'PUT',
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(newContent)
        }
        fetch('/api/challenge/'+this.challengeDetails.challenge.dataChallenge['challenge_id'], initObject)
          .then(response => 
            response.json()
          )
          .then((dataChallenge) => {
                this.challengeDetails.challenge.updateData(dataChallenge);
                this.challengeDetails.challenge.challengeButton.onClick()
              }
          )
          .catch(error => console.error(error));
    }
    getHtmlRender(){
        var day_numbers = {
            'little' : {'title' : '7 Jours', 'value' : 7},
            'medium' : {'title' : '14 Jours', 'value' : 14},
            'large' : {'title' : '21 Jours', 'value' : 21}
        }
        var options_day_number = ``;
        for (const [day_number_id, day_number] of Object.entries(day_numbers)){
            options_day_number += `<option ${this.challengeDetails.challenge.dataChallenge['day_number'] === day_number['value'] ? 'selected' : ''} value="${day_number['value']}" class="select-option"> ${day_number['title']} </option>`        
        };

        var res = `
            <form id="form-challenge-settings" class="row g-3 needs-validation" novalidate> 
                <div class="row">
                    <div class="col-md-6 mb-3">
                        <label for="input-food-type" class="form-label">Nom du challenge </label>
                        <input type="text" class="form-control" id="input-challenge-name" value="${this.challengeDetails.challenge.dataChallenge['name']}">
                    </div>
                    <div class="col-md-6 mb-3">
                        <label for="input-food-type" class="form-label">Nombre de jours</label>
                        <select class="chosen-select" id="input-challenge-days-number" data-style="select-option">
                            ${options_day_number}
                        </select>
                    </div>
                </div>
                <div class="row">
                    <div class="col-3">
                        <button type="button" class = "delete-challenge-button" id="delete-challenge-button">   
                            <div>
                                Supprimer
                            </div>
                            <div>
                                <i data-feather="trash-2" color="red"></i> 
                            </div>
                        </button>
                    </div>
                </div>
                <div class="form-challenge-settings-button-container">
                    <button type="button" class="btn btn-primary" id="button-save-challenge-settings">Sauvegarder</button>
                </div>
            </form>        
        `
        res = new DOMParser().parseFromString(res , 'text/html').childNodes[0].childNodes[1].childNodes[0];


        res.querySelector('#button-save-challenge-settings').addEventListener(
            'click',
            this.onSave.bind(this)
        );

        res.querySelector('#delete-challenge-button').addEventListener(
            'click',
            this.onDeleteAskConfirmation.bind(this)
        );

        return res;
    }
}

export class ChallengeDetails{
    constructor(dataChallengeButton, parent){
        this.dataChallengeButton = dataChallengeButton;
        this.foodConsumptions = null;
        this.dayConsumptions = null;
        this.challenge = parent;
        this.review = new Review(this);
        this.ChallengeSettingsForm = new ChallengeSettingsForm(this);
    }
    delete(){
        $('#challengeDetailsModal').modal('hide');
    }
    updateData(data){
        this.dataChallengeButton = data;
    }
    getHtmlRender(){
        var res = `
            <div>
                <div class='challenge-details-body'>
                </div>
            </div>`
        res = new DOMParser().parseFromString(res , 'text/html').childNodes[0].childNodes[1].childNodes[0];
        return res
    }
    submitUpdateChallenge(){
        console.log("Update du challenge !")
    }
    getReview(){
        console.log("getReview");
        
        // mise à jour du corps du challenge-details
        document.querySelector('.challenge-details-body').replaceChildren(this.review.getHtmlRender());

        // affichage du ou des graphiques
        this.review.display();
    }
    openSettings(){
        // mise à jour du corps du challenge-details
        console.log("openSettings")
        document.querySelector('.challenge-details-body').replaceChildren(this.ChallengeSettingsForm.getHtmlRender());

        //$('select').selectpicker();
        $('.chosen-select').chosen({width: "100%"});

        feather.replace();
    }

    display(){
        console.log("display CHallengeDetails");
        $('#challengeDetailsModal').modal('show');
        
        // mise à jour du corps du modal 
        document.querySelector('.modalContent').replaceChildren(this.getHtmlRender());

        // mise en place du listener pour les paramètres du challenge 
        document.querySelector('#challenge-settings-button').addEventListener(
            "click",
            this.openSettings.bind(this)
        );

        // affichage du bilan
        this.getReview();

        feather.replace();
    }
}