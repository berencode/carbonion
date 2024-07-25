// static/js/day_consumption.js

import { FoodConsumption, FoodConsumptionSelect} from "./food_consumption.js";

export class DayConsumptionManager{
  constructor(){
    this.listDaysConsumptions = document.querySelector(".day-consumption-list");
    this.foods = null;        // référentiel des aliments (à charger une seule fois)
    this.indicators = null;   // référentiel des indicateurs (à charger une seule fois)
    this.currentIndicator = null; // indicateur courant sélectionné
    this.dictChallenges = {};
    this.loadIndicators();
    this.loadFoodReferential();
    this.loadChallenges();
    this.activateCreateDayButton();
    this.daysConsumptions = [];
  }

  displayLoading(){
    document.querySelector(".content-loaded").classList.add('hide');
    document.querySelector(".content-loading").classList.remove('hide');

  }
  displayContent(){
    document.querySelector(".content-loading").classList.add('hide');
    document.querySelector(".content-loaded").classList.add('display');
  }
  
  activateAllConsumptionDays() {
    /* On commence par avertir l'utilisateur qu'on charge les données*/
    this.displayLoading();

    let initObject = {
        method: 'GET',
        headers: {
            "Content-Type": "application/json",
        }
    }
    fetch('/api/day_consumption', initObject)
    .then(response => 
            response.json()
    )
    .then((dataConsumptionDays) => {
          dataConsumptionDays.forEach((dataConsumptionDay, index)=>{
            /* Création du jour de consommation*/
            var dayConsumption = new DayConsumption(dataConsumptionDay, this, this.foods, index);

            /* Ajout du bouton pour accéder au jour de consommation */
            this.listDaysConsumptions.appendChild(
              dayConsumption.dayConsumptionGetDetailsButton.getHtmlRender()
            )

            /* Ajout du jour de consommation dans la liste*/
            this.daysConsumptions.push(dayConsumption);

            /* Par défaut, on affiche le premier jour de consommation*/
            if(index == 0){
              dayConsumption.dayConsumptionDetails.display()
            }
          })
        }
    )
    .catch(error => console.error(error));
    
    
    /* On arrête d'afficher le chargement et on affiche les données*/
    this.displayContent();

  }


  loadChallenges(){
    // Load de tous les challenges de l'utilisateur
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
                    this.dictChallenges[challenge.challenge_id] = challenge;
                });
            }
        )
        .catch(error => console.error(error));    
  }
  loadFoodReferential(){
    /* Permet de ne charger qu'une seule fois le référentiel de tous les aliments*/
    let initObject = {
        method: 'GET',
        headers: {
            "Content-Type": "application/json",
        },
    }
    fetch('/api/food', initObject)
      .then(response => 
              response.json()
      )
      .then((data) => {
              
              var dictionaryById = {};
              for (var i = 0; i < data.length; i++) {
                var currentObject = data[i];
                var id = currentObject.code_agb;
                dictionaryById[id] = currentObject;
              }
              this.foods = dictionaryById

              // Une fois le référentiel chargé, on peut charger les jours.
              this.activateAllConsumptionDays();
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

  activateCreateDayButton(){
    /* permet d'activer le bouton de création d'un nouveau jour de consommation*/
    const createDayButton = document.querySelector(".button-create-day-consumption");
    
    createDayButton.addEventListener(
      "click",
      this.createDayConsumption.bind(this)
    );
  }

  
  createDayConsumption() {
    /*
        Créé un nouveau jour à la sauvegarde du modal de création 
        puis actualise l'affichage avec ce nouveau jour.
    */

    let initObject = {
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({})
    }
    
    fetch('/api/day_consumption', initObject)
        .then(response => 
                response.json()
        )
        .then((data) => {
                /* Création du nouveau jour de consommation*/
                var dayConsumption = new DayConsumption(data, this, this.foods, (this.daysConsumptions.length));

                /* Ajout du bouton pour accéder au jour de consommation */
                this.listDaysConsumptions.appendChild(
                  dayConsumption.dayConsumptionGetDetailsButton.getHtmlRender()
                );
                
                /* Baisser le scroll */
                $('.day-consumption-list').scrollTop(1000)
                this.listDaysConsumptions.scrollTop = this.listDaysConsumptions.scrollHeight;

                /* Ajout dans la liste*/
                this.daysConsumptions.push(
                  dayConsumption
                );

                /* Affichage du nouveau jour*/
                dayConsumption.dayConsumptionDetails.display()

            }
        )
        .catch(error => console.error(error));
  }


  scrollToBottom(container) {
    var children = container.children('.day-consumption-card');
    container.scrollTop += 10000;
  }
}


export class DayConsumption{
  // C'est elle qui aura la responsabilité de créer ensuite le bouton associé + le détail à afficher.
  // Créer donc 2 nouvelles classes.
  constructor(dataDayConsumption, DayConsumptionManager, foods, index){
    this.dataDayConsumption = dataDayConsumption;
    this.dayConsumptionId = dataDayConsumption.day_consumption_id;
    this.date = dataDayConsumption.date;
    this.userId = dataDayConsumption.user_id;
    this.foods = foods;
    this.dayConsumptionManager = DayConsumptionManager;
    this.dayConsumptionGetDetailsButton = new DayConsumptionGetDetailsButton(this, dataDayConsumption, index);
    this.dayConsumptionDetails = new DayConsumptionDetails(this, this.dayConsumptionId, this.date, this.userId, this.dataDayConsumption);
    this.currentIndicator = 0;
  }
  updateDataDayConsumption(dataDayConsumption){
    // Mise à jour des informations pour l'objet et les objets dépendants
    this.dataDayConsumption = dataDayConsumption;
    this.date = this.dataDayConsumption['date'];
    this.dayConsumptionGetDetailsButton.dataDayConsumption = dataDayConsumption;
    this.dayConsumptionGetDetailsButton.refresh();
  }
}



export class DayConsumptionGetDetailsButton{
  constructor(dayConsumption, dataDayConsumption, index){
    this.dataDayConsumption = dataDayConsumption;
    this.dayConsumption = dayConsumption;
    this.index = index; //position dans la liste des jours
  }

  onClick(){
    /* maj du details associé au bouton */
    this.dayConsumption.dayConsumptionDetails.display()
  }

  getHtmlRender(){
    var logoCheck =  this.dataDayConsumption.is_finished===true ? 'check-circle' : 'circle'
    //TODO : rect-color-challenge
    var challenge_color = this.dayConsumption.dayConsumptionManager.dictChallenges[this.dataDayConsumption.challenge_id]['color']
    var res = `
        <div class="day-consumption-card" data-day-consumption-id=${this.dataDayConsumption.day_consumption_id}>
            <button class='button-get-details-day-consumption' day-consumption-id = '${this.dataDayConsumption.day_consumption_id}'>                
              <div class="text">Jour ${this.index + 1}</div>  
              <i data-feather="`+logoCheck+`" color="white" style="flex:1"></i>    
            </button>
            <rect class="rect-color-challenge" style="background-color:${challenge_color}">
        </div>
      `
    res = new DOMParser().parseFromString(res , 'text/html').childNodes[0].childNodes[1].childNodes[0];

    res.querySelector('.button-get-details-day-consumption').addEventListener(
        "click",
        this.onClick.bind(this)
    );
    return res
  }
  refresh(){
    document.querySelector('.day-consumption-card[data-day-consumption-id="'+this.dataDayConsumption.day_consumption_id+'"]').replaceWith(
        this.getHtmlRender()
    )
    feather.replace();
  }
}

export class DayConsumptionDetails{
  constructor(dayConsumption, dayConsumptionId, date, userId, dataDayConsumption){
    this.dayConsumptionId = dayConsumptionId;
    this.date = date;
    this.userId = userId;
    this.chart = null;
    this.foodConsumptions = [];
    this.dataDayConsumption = dataDayConsumption;
    this.modalImport = new ModalImport(this);
    this.resumeIndicators = new ResumeIndicators(this);
    this.dayConsumption = dayConsumption;
  }

  display(){
    /* On doit ensuite obtenir toutes les informations relatives aux food consumptions*/
    var foodConsumptions = []
    let initObject = {
        method: 'GET',
        headers: {
            "Content-Type": "application/json",
        },
    }
    fetch('/api/food_consumption/'+this.dayConsumptionId, initObject)
      .then(response => 
        response.json()
      )
      .then((dataConsumptionFoods) => {
            var listFoodConsumptions = document.createElement("div");
            listFoodConsumptions.classList.add('food-consumption-list');
            dataConsumptionFoods.forEach((dataConsumptionFood, index)=>{
              /* Création de la consommation*/
              var foodConsumption = new FoodConsumption(dataConsumptionFood, this, true);
              /* Ajout de la consommation à la liste en front*/
              listFoodConsumptions.appendChild(
                foodConsumption.foodConsumptionGetDetailsButton.getHtmlRender()
              );

              /* Ajout de la consommation à la liste en back*/
              foodConsumptions.push(foodConsumption);
            })

            // stockage dans l'objet des jours de consommations
            //this.dataConsumptionFoods = dataConsumptionFoods
            this.foodConsumptions = foodConsumptions;
            this.getHtmlRender(listFoodConsumptions);
            this.createApexChart();
            this.resumeIndicators.display()
          }
      )
      .catch(error => console.error(error));
        
      /* Désélection de tous les autres boutons */
      var buttons = document.querySelectorAll('.day-consumption-list')[0].childNodes

      for (var j = 1; j < buttons.length; j++) {
        var child = buttons[j];
        if(child.querySelector('button') != null){
          child.querySelector('button').classList.remove('selectionned-day-consumption')
        }
      }

      /* Modification du style de la liste pour montrer quel jour on sélectionne */
      var getDetailsButton = document.querySelector('[day-consumption-id="'+this.dayConsumptionId+'"]')
      getDetailsButton.classList.add('selectionned-day-consumption')
  }

  update(){
    //var index = this.dataConsumptionFoods.map(function(e) { return e.food_consumption_id; }).indexOf(dataConsumptionFood.food_consumption_id);
    //this.dataConsumptionFoods[index] = dataConsumptionFood;
    
    // mise à jour du graph
    this.updateDataApexChart();

    // mise à jour du résumé des indicateurs
    this.resumeIndicators.display();
  }

  delete(foodConsumption){
    console.log(foodConsumption.dataConsumptionFood.quantity);
    function removeObject(array, property, value) {
        console.log('searched : ', value);
        console.log("array, ", [...array]);
        let index = array.findIndex(obj => obj.dataConsumptionFood[property] === value);
        console.log("index : ", index);
        if (index !== -1) {
            array.splice(index, 1);
        }
    }
    // suppression
    console.log(foodConsumption.dataConsumptionFood.food_consumption_id);
    console.log(this.foodConsumptions);
    removeObject(this.foodConsumptions, "food_consumption_id", foodConsumption.dataConsumptionFood.food_consumption_id);
    
    console.log(this.foodConsumptions);
    // mise à jour du graph
    this.updateDataApexChart();

    // mise à jour du résumé des indicateurs
    this.resumeIndicators.display();
  }



  getHtmlRender(listFoodConsumptions){

    var indicatorsMenuOptions = ``;
    var indicators = this.dayConsumption.dayConsumptionManager.indicators;
    for (const [indicator_id, indicator] of Object.entries(indicators)){
      indicatorsMenuOptions += `<button class ="indicator-menu-item" indicator-id="${indicator_id}"> ${indicator['label']} </button>`        
    };

    var date = new Date(Date.parse(this.dayConsumption.date));

    console.log(this.dayConsumption.dataDayConsumption);
    var res = `
        <div class="day-consumption-details-card" data-day-consumption-id="${this.dayConsumptionId}">

            <div class="main-row-container">
              <div class = "title-row-container">
                <div class="title-row-item secondary">
                </div>
                <div class="title-row-item principal" id="title-date">
                  ${date.toLocaleDateString()}
                </div>
                <div class="title-row-item secondary">
                  <button class="btn" type="button" data-bs-toggle="collapse" data-bs-target="#metadata" aria-expanded="false" aria-controls="metadata">
                        <i data-feather="settings" color="white"></i>       
                  </button> 
                  
                </div>
              </div>

              <div class="row">
                <div class="col">
                  <div class="collapse multi-collapse" id="metadata">
                    <div class="row" style="padding:10px">
                        <div class="col-md-6">
                          <label for="metadata-date" class="form-label">Date</label>
                          <input type="date" class="form-control" id="metadata-date" required value="${this.dayConsumption.date}">
                        </div> 
                        <div class="col-md-6">
                          <label for="metadata-comment" class="form-label">Commentaire</label>
                          <input type="text" class="form-control" id="metadata-comment" placeholder="" required value="${this.dayConsumption.dataDayConsumption.commentary}">
                        </div> 
                    </div>
                    <div class="row" style="padding:10px">
                        <div class="update-metadata-button-container">
                          <button class = "update-metadata-button" id ="button-save-metadata-day-consumption" data-bs-toggle="collapse" data-bs-target=".multi-collapse"> 
                            <div class="details-button-label"> Sauvegarder </div>
                            <i data-feather="save" color="#2ecc71"></i>
                          </button>
                        </div> 
                    </div>
                  </div>
                </div>
              </div>
              <div class="collapse multi-collapse show" id="graph-row">
                <div class = "graph-row-container">
                  <div class = "indicator-menu-container">
                    ${indicatorsMenuOptions}
                  </div>
                  <div class="right-graph-day-container">
                    <div class = "graph-day-container">
                    </div>
                    <div class = "graph-type-container">
                        <div class='container-resume-indicator'>
                        </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="expand-button-container">
              <button class="details-button" type="expand-button" id ="expand-button" data-bs-toggle="collapse" data-bs-target="#graph-row" aria-expanded="false" aria-controls="graph-row">
                <i data-feather="chevron-up" color="white" id="expand-icon"></i>
              </button>
            </div>
            <div class = "details-button-container">
                  <button class = "details-button" id ="button-create-food-consumption" data-action="create"> 
                    <div class="details-button-label"> Ajouter </div>
                    <i data-feather="plus-circle" color="#2ecc71"></i>
                  </button>
                  <button class = "details-button" id ="button-import-food-consumption" data-action="create" data-bs-toggle="modal" data-bs-target="#importModal">
                    <div class="details-button-label"> Importer </div>
                    <i data-feather="download" color="#bb8fce"></i>
                  </button>
                  <button class = "details-button" id ="button-finish-food-consumption"  data-bs-toggle="modal" data-bs-target="#confirmationModal">
                    <div class="details-button-label">Cloturer</div>
                    <i data-feather="check-circle" color="#85c1e9"></i>
                  </button>
                  <button class = "details-button" id ="button-share-day-consumption"  data-bs-toggle="modal" data-bs-target="#shareModal"> 
                    <div class="details-button-label"> Partager </div>
                    <i data-feather="share-2" color="#aaac71"></i>
                  </button>
                  <input type="checkbox" class="btn-check"  id ="button-modify-food-consumption"  autocomplete="off">
                  <label class="details-button"  for="button-modify-food-consumption" >
                    <div class="details-button-label"> Supprimer </div>
                    <i data-feather="trash-2" color="#e74c3c"></i>
                  </label>  
                  
            </div>
            <div class = "food-consumption-list">
            </div>
        </div>
      `
    
    res = new DOMParser().parseFromString(res , 'text/html').childNodes[0].childNodes[1].childNodes[0];
    
    // Ajout de la liste des types d'indicateurs différents

    var indicatorButtons = res.getElementsByClassName("indicator-menu-item");
    for (var i = 0; i < indicatorButtons.length; i++) {
      indicatorButtons[i].addEventListener('click', function(event) {
        var indicatorId = event.target.getAttribute('indicator-id');
        this.onClickUpdateIndicator(indicatorId);
      }.bind(this));
    }

    // Ajout de la liste des aliments
    res.querySelector('.food-consumption-list').replaceWith(
      listFoodConsumptions
    ) 

    // Activation du bouton "Sauvegarder" (lorsqu'on modifie les méta-données en haut)
    res.querySelector("#button-save-metadata-day-consumption").addEventListener(
      "click",
      this.onClickUpdateMetadata.bind(this)
    );

    // Modification du bouton lorsqu'on agrandit la zone d'affichage des aliments
    var myCollapsible = res.querySelector('#graph-row');
    myCollapsible.addEventListener('hidden.bs.collapse', function () {
      // fermeture
      var down = `<i data-feather="chevron-down" color="white" id="expand-icon"></i>`
      down = new DOMParser().parseFromString(down , 'text/html').childNodes[0].childNodes[1].childNodes[0];
      res.querySelector('#expand-icon').replaceWith(down);
      feather.replace();
    })


    myCollapsible.addEventListener('show.bs.collapse', function () {
      // ouverture
      var up = `<i data-feather="chevron-up" color="white" id="expand-icon"></i>`
      up = new DOMParser().parseFromString(up , 'text/html').childNodes[0].childNodes[1].childNodes[0];
      res.querySelector('#expand-icon').replaceWith(up);
      feather.replace();
    })

    
    // Activation du bouton "Ajouter"
    res.querySelector("#button-create-food-consumption").addEventListener(
        "click",
        this.onClickCreateFood.bind(this)
    );

    // Activation du bouton "Importer"
    res.querySelector("#button-import-food-consumption").addEventListener(
        "click",
        this.modalImport.display.bind(this.modalImport)
    );

    // Activation du bouton "Modifier"
    res.querySelector("#button-modify-food-consumption").addEventListener(
        "click",
        (event) => this.onClickModifyFoods(event)
    );
    
    // Activation et réinitialisation du bouton "Cloturer" dans le modal de confirmation
    var buttonFinishModal = document.querySelector("#button-yes-confirmation-modal")
    buttonFinishModal.replaceWith(buttonFinishModal.cloneNode(true));
    buttonFinishModal = document.querySelector("#button-yes-confirmation-modal")
    buttonFinishModal.addEventListener(
      "click",
      this.onClickFinishDay.bind(this)
    );

     // Activation et réinitialisation du bouton Importer dans le modal d'import
     var buttonFinishModal = document.querySelector("#button-yes-import-modal")
     buttonFinishModal.replaceWith(buttonFinishModal.cloneNode(true));
     buttonFinishModal = document.querySelector("#button-yes-import-modal")
     buttonFinishModal.addEventListener(
       "click",
       this.modalImport.submit.bind(this.modalImport)
     );

    document.getElementsByClassName('day-consumption-details-card')[0].replaceWith(res)
    feather.replace();
  }
  onClickModifyFoods(event){
    /* Au click du bouton "modifier" */
    var trashes = document.querySelectorAll('#delete-food-item');

    var display = 'none';
    if(event.target.checked == true){
      display = 'flex' 
    }
    for (var i = 0; i < trashes.length; i++){
      var trash = trashes[i]
      trash.style.display = display;
    }
    feather.replace();
  }
  
  onClickFinishDay(){
    /* On modifie le jour de consommation courant*/
    this.dataDayConsumption.is_finished = !this.dataDayConsumption.is_finished
    let initObject = {
        method: 'PUT',
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(this.dataDayConsumption)
    }
    fetch('/api/day_consumption/'+this.dataDayConsumption.day_consumption_id, initObject)
      .then(response => 
        response.json()
      )
      .then((dataDayConsumption) => {

            // Mise à jour du dataDayConsumption local pour toutes les instances dépendantes.
            this.dayConsumption.updateDataDayConsumption(dataDayConsumption);
            
            // fermeture du modal
            $('#confirmationModal').modal('hide')

          }
      )
      .catch(error => console.error(error));
      
  }
  onClickUpdateIndicator(indicatorId){
    this.dayConsumption.dayConsumptionManager.currentIndicator = indicatorId;
    console.log(this.dayConsumption.dayConsumptionManager.currentIndicator);
    this.display()
  }
  onClickUpdateMetadata(){
    var date = document.querySelector("#metadata-date").value;
    var commentary = document.querySelector("#metadata-comment").value;
    this.date = date;
    this.dataDayConsumption.date = date;
    this.dataDayConsumption.commentary = commentary;
    let initObject = {
        method: 'PUT',
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(this.dataDayConsumption)
    }
    fetch('/api/day_consumption/'+this.dataDayConsumption.day_consumption_id, initObject)
      .then(response => 
        response.json()
      )
      .then((dataDayConsumption) => {
            // Nouveau titre
            var date = new Date(Date.parse(dataDayConsumption.date));
            
            var res = `
            <div id="title-date" class="title-row-item principal">
              ${date.toLocaleDateString()}
            </div>
            `
            res = new DOMParser().parseFromString(res , 'text/html').childNodes[0].childNodes[1].childNodes[0];
            
            // Mise à jour du titre
            document.querySelector('#title-date').replaceWith(res)
                    
            // Mise à jour du dataDayConsumption local pour toutes les instances dépendantes.
            this.dayConsumption.updateDataDayConsumption(dataDayConsumption);
            

          }
      )
      .catch(error => console.error(error));
  }

  onClickCreateFood(){
    /* On doit d'abord créer la consommation d'aliments.*/
    var foodConsumption = new FoodConsumption(
      {
        'quantity' : 0, 
        //'carbon_footprint': 0, 
        'comment' : '', 
        'ref_id' : '20035',
        'unite' : 'g',
        'color' : '#27AE60'
    }, this, false);

    foodConsumption.foodConsumptionModal.display();
  }
  
  updateDataApexChart(){
    var newData = this.generateDataApexChart(this.foodConsumptions)
    var colors = this.generateColorsApexChart(this.foodConsumptions);
    this.chart.updateSeries([{
        data: newData
    }])

    this.chart.updateOptions({
      colors : colors
    })
  }
  addDataApexChart(foodConsumption){
    var data = this.generateDataApexChart([foodConsumption])
    var colors = this.generateColorsApexChart();
    
    this.chart.appendData([{
      data : data 
    }]);
    
    this.chart.updateOptions({
      colors : colors
    })

    
  }
  generateDataApexChart(){
    var data = []

    for(var i = 0; i < this.foodConsumptions.length; i ++){
      var currentFoodConsumption = this.foodConsumptions[i]
      data.push(
        {
          x : this.dayConsumption.foods[currentFoodConsumption.dataConsumptionFood['ref_id']]['nom_produit'],
          y : currentFoodConsumption.indicatorValues[this.dayConsumption.dayConsumptionManager.currentIndicator]
        }
      )
    }
    return data
  }
  generateColorsApexChart(){
    var colors = []
    for(var i = 0; i < this.foodConsumptions.length; i ++){
      var currentFoodConsumption = this.foodConsumptions[i]
      colors.push(
        currentFoodConsumption.dataConsumptionFood['color'],        
      )
    }
    return colors
  }
  createApexChart(){

      var data = this.generateDataApexChart(this.foodConsumptions);
      var colors = this.generateColorsApexChart(this.foodConsumptions);
      // Construction de "data" adapté pour la création du graphique.

      var options = {
          colors: colors,
          plotOptions: {
            treemap: {
              distributed: true
            },
          },
          series: [{
                data: data
          }],
          legend: {
            show: true
          },
          
          chart: {
              height : 300,
              id: 'salesChart',
              type: 'treemap',
              offsetX: 0,
              offsetY: 0,
              parentHeightOffset: 0,
              width: '100%',
              toolbar: {
                show: true
              },
              
              sparkline: {
                  enabled: true,
              },
          },
          tooltip: {
            y: {
                formatter: (seriesName) => seriesName + 'kg éq.CO2',
            },
          },
          responsive: [{
              breakpoint: undefined,
              options: {},
          }]
      };
      var chart = new ApexCharts(document.querySelector(".graph-day-container"), options);
      $(document).ready(function(){
          chart.render();
      })
      this.chart = chart;
  }

}


export class ResumeIndicators{
  constructor(dayConsumptionDetails){
    this.dayConsumptionDetails = dayConsumptionDetails;

  }

  display(){
    var sum = 0;
    var indicators = this.dayConsumptionDetails.dayConsumption.dayConsumptionManager.indicators;
    var currentIndicator = this.dayConsumptionDetails.dayConsumption.dayConsumptionManager.currentIndicator;
    this.dayConsumptionDetails.foodConsumptions.forEach((foodConsumption, index)=>{
      sum = sum + foodConsumption.indicatorValues[currentIndicator];
    })

    
    res = `
    <div class='container-resume-indicator'>
      <p class='quantity-carbon-footprint'> ${Math.round(sum*100)/100} </p>
      <p class='unit-carbon-footprint'> ${indicators[currentIndicator]['unit']}</p>
    </div>
    `
    var res = new DOMParser().parseFromString(res, 'text/html').childNodes[0].childNodes[1].childNodes[0];

    var resumeContainer = document.querySelector('.container-resume-indicator');
    resumeContainer.replaceWith(res);

  }
}


export class ModalImport{
  constructor(dayConsumptionDetails){
    this.dayConsumptionDetails = dayConsumptionDetails;
    this.dataConsumptionFoods = null;
    this.selectionnedFoodConsumptionsIds = [];
  }
  display(){
    // Réinitialisation de la liste des sélections lors de l'affichage
    this.selectionnedFoodConsumptionsIds = [];

    // Création du container de la liste des imports
    var modalBody = document.querySelector('#form-import').querySelector('.modal-body');
    var modalBodyContent = `
        <div class = 'modalContent'>
          Mes aliments
          <div id="list-import-day-consumption">
          </div>
        </div>
    `
    var newModalBody = new DOMParser().parseFromString(modalBodyContent, 'text/html').childNodes[0].childNodes[1].childNodes[0];
    //modalBody.replaceChildren(newModalBody);

    var listImportDay = newModalBody.querySelector('#list-import-day-consumption');
    
    // Remplissage par toutes les consommations de l'utilisateur
      let initObject = {
        method: 'GET',
        headers: {
            "Content-Type": "application/json",
        },
    }

    
    fetch('/api/food_consumption', initObject)
        .then(response => 
                response.json()
        )
        .then((dataConsumptionFoods) => { 
              dataConsumptionFoods.forEach((dataConsumptionFood, index)=>{

                var currentDayConsumptionId = this.dayConsumptionDetails.dayConsumptionId
          
                /* On vérifie que la consommation courante n'est pas dans le jour courant (car par à importer)*/
                if(dataConsumptionFood.day_consumption_id != currentDayConsumptionId){
                  /* Création de la sélection de consommation*/
                  var foodConsumption = new FoodConsumptionSelect(this, dataConsumptionFood);
                  /* Ajout de la consommation */
                  listImportDay.appendChild(
                    foodConsumption.foodConsumptionGetDetailsButton.getHtmlRender()
                  );
                }
                
              });
              modalBody.replaceChildren(newModalBody);

              /* On stock les données des aliments (utile en cas d'import)*/
              this.dataConsumptionFoods = dataConsumptionFoods
              feather.replace();
              
            }
        )
        .catch(error => console.error(error));

  }
  updateSelection(food_consumption_id){
    var foodConsumptionIndex = this.selectionnedFoodConsumptionsIds.indexOf(food_consumption_id)
    if(foodConsumptionIndex == -1){
      // Si l'identifiant n'est pas dans la liste des selectionné, on l'ajoute
      this.selectionnedFoodConsumptionsIds.push(food_consumption_id);
    }
    else {
      // Sinon, on le retire
      this.selectionnedFoodConsumptionsIds.splice(foodConsumptionIndex, 1);
    }
  }
  submit(){
    // création dans le jour courant de dupplication des jours selectionnés.
    this.selectionnedFoodConsumptionsIds.forEach((food_consumption_id, index)=>{

      var currentFoodConsumptionIndex = this.dataConsumptionFoods.map(function(e) { return e.food_consumption_id; }).indexOf(food_consumption_id);
      
      // On clone la consommation d'aliments
      var currentFoodConsumption = { ...this.dataConsumptionFoods[currentFoodConsumptionIndex]};
      // On met à jour le jour de consommation
      currentFoodConsumption.day_consumption_id = this.dayConsumptionDetails.dayConsumption.dayConsumptionId;
      
      var foodConsumptions = [];
      /* On créé la consommation d'aliment */
      let initObject = {
          method: 'POST',
          headers: {
              "Content-Type": "application/json",
          },
          body: JSON.stringify(currentFoodConsumption)
      }
      fetch('/api/food_consumption', initObject)
        .then(response => 
          response.json()
        )
        .then((dataConsumptionFood) => {
              var foodConsumption = new FoodConsumption(dataConsumptionFood, this.dayConsumptionDetails, true);
              /* Ajout de la consommation à la liste en front */
              var listFoodConsumptions = document.querySelector('.food-consumption-list');
              
              listFoodConsumptions.appendChild(
                foodConsumption.foodConsumptionGetDetailsButton.getHtmlRender()
              );

              /* Ajout de la consommation à la liste en back*/
              this.dayConsumptionDetails.foodConsumptions.push(foodConsumption);

              /* Mise à jour de la nouvelle consommation dans le détail*/
              //this.dayConsumptionDetails.dataConsumptionFoods.push(dataConsumptionFood);

              /* Mise à jour du graphique */
              this.dayConsumptionDetails.updateDataApexChart();
              //this.dayConsumptionDetails.addDataApexChart(dataConsumptionFood);

              /* Mise à jour du compte rendu des indicateurs*/
              this.dayConsumptionDetails.resumeIndicators.display();

            }
        )
        .catch(error => console.error(error));
    })
    $('#importModal').modal('hide');
  }
}