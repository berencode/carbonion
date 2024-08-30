// static/js/day_consumption.js

import { FoodConsumption, FoodConsumptionSelect} from "./food_consumption.js";

export class DayConsumptionSharedManager{
  constructor(){
    this.foods = null;        // référentiel des aliments (à charger une seule fois)
    this.indicators = null;   // référentiel des indicateurs (à charger une seule fois)
    this.currentIndicator = null; // indicateur courant sélectionné
    this.loadIndicators();
    this.loadFoodReferential();
  }

  displayLoading(){
    document.querySelector(".content-loaded").classList.add('hide');
    document.querySelector(".content-loading").classList.remove('hide');

  }
  displayContent(){
    document.querySelector(".content-loading").classList.add('hide');
    document.querySelector(".content-loaded").classList.add('display');
  }
  
  activateConsumptionDay() {
    /* On commence par avertir l'utilisateur qu'on charge les données*/
    this.displayLoading();

    var dayConsumptionId = document.querySelector('#day-consumption-to-display').getAttribute('day-consumption-id');
    let initObject = {
        method: 'GET',
        headers: {
            "Content-Type": "application/json",
        }
    }
    fetch('/api/day_consumption/'+dayConsumptionId, initObject)
    .then(response => 
            response.json()
    )
    .then((dataConsumptionDay) => {
            var dayConsumption = new DayConsumption(dataConsumptionDay, this, this.foods, 0);
            this.dayConsumption = dayConsumption;
            dayConsumption.dayConsumptionDetails.display()
        }
    )
    .catch(error => console.error(error));
    /* On arrête d'afficher le chargement et on affiche les données*/
    this.displayContent();
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
              this.activateConsumptionDay();
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
    this.dayConsumptionDetails = new DayConsumptionDetails(this, this.dayConsumptionId, this.date, this.userId, this.dataDayConsumption);
    this.currentIndicator = 0;
  }
  updateDataDayConsumption(dataDayConsumption){
    // Mise à jour des informations pour l'objet et les objets dépendants
    this.dataDayConsumption = dataDayConsumption;
    this.date = this.dataDayConsumption['date'];
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
              var foodConsumption = new FoodConsumption(dataConsumptionFood, this, false, false);
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

    // mise à jour des consommations
    this.foodConsumptions.forEach((foodConsumption, index)=>{
      foodConsumption.updateIndicator()
    })
  }

  delete(foodConsumption){
    function removeObject(array, property, value) {
        let index = array.findIndex(obj => obj.dataConsumptionFood[property] === value);
        if (index !== -1) {
            array.splice(index, 1);
        }
    }
    // suppression
    removeObject(this.foodConsumptions, "food_consumption_id", foodConsumption.dataConsumptionFood.food_consumption_id);
    
    // mise à jour du graph
    this.updateDataApexChart();

    // mise à jour du résumé des indicateurs
    this.resumeIndicators.display();
  }



  getHtmlRender(listFoodConsumptions){

    var indicatorsMenuOptions = ``;
    var indicators = this.dayConsumption.dayConsumptionManager.indicators;
    for (const [indicator_id, indicator] of Object.entries(indicators)){
      var class_selectionned = ""
      if(this.dayConsumption.dayConsumptionManager.currentIndicator == indicator_id){
        class_selectionned = "indicator-selectionned"
      }
      indicatorsMenuOptions += `<button class ="indicator-menu-item ${class_selectionned}" indicator-id="${indicator_id}"> ${indicator['label']} </button>`        
    };

    var date = new Date(Date.parse(this.dayConsumption.date));

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

    document.getElementsByClassName('day-consumption-details-card')[0].replaceWith(res)
    feather.replace();
  }
  onClickUpdateIndicator(indicatorId){
    // Déselection de l'ancien bouton
    var getDetailsButton = document.querySelector('[indicator-id="'+this.dayConsumption.dayConsumptionManager.currentIndicator+'"]')
    getDetailsButton.classList.remove('indicator-selectionned')

    this.dayConsumption.dayConsumptionManager.currentIndicator = indicatorId;
    
    // Sélection du nouveau bouton
    var getDetailsButton = document.querySelector('[indicator-id="'+this.dayConsumption.dayConsumptionManager.currentIndicator+'"]')
    getDetailsButton.classList.add('indicator-selectionned')

    this.update()
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

