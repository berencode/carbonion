import { DataGenerator } from "./chart_data_generator.js";
import { ComputeIndicator } from "./compute_indicator.js";


var dataGenerator = new DataGenerator()
var CONFIG =
    {
        title : 'introPage',
        content : {
            default : ['stackedColumn', 'Repas'],
            tabs : {
                'stackedColumn':{
                    'Repas' : {
                        title : 'Évolution par type de repas',
                        fonction : dataGenerator.getFootPrintEvolutionMealType,
                    },
                    'Aliments' : {
                        title : "Évolution par type d'aliments",
                        fonction : dataGenerator.getFootPrintEvolutionFoodType,
                    }
                },
                'polarArea':{
                    'Repas' : {
                        title : 'Évolution par type de repas',
                        fonction : dataGenerator.getFootPrintRepartitionMealType,
                    },
                    'Aliments' : {
                        title : "Évolution par type d'aliments",
                        fonction : dataGenerator.getFootPrintRepartitionFoodType,
                    }
                }
            }
        },
        logos : {
            'stackedColumn' : 'bar-chart-2',
            'polarArea' : 'pie-chart'
        }
    }

export class Review{
    constructor(parent){
        this.challengeDetails = parent;
        this.reviewItem = new ReviewItem(this);
        /*this.page = {}
        for(var i = 0; i < CONFIG.length; i++){
            this.page[i] = (new ReviewPage(this, i, CONFIG[i]))
        }*/
        this.computeIndicator = new ComputeIndicator();

        // configuration du graphique actuellement affiché
        this.currentIndicator = 'carbone';
        this.currentTab = ['stackedColumn', 'Repas'];
    }

    getHtmlRender(){
        var indicatorsMenuOptions = ``;
        var indicators = this.challengeDetails.challenge.challengeManager.indicators;
        for (const [indicator_id, indicator] of Object.entries(indicators)){
            indicatorsMenuOptions += `<button type="button" class ="indicator-menu-item" indicator-id="${indicator_id}"> ${indicator['label']} </button>`        
        };

        var res = `
        <div>
            <div class='review-main-row-container'>
                <div class='review-indicators-container'> 
                    <div class = "indicator-menu-container">
                        ${indicatorsMenuOptions}
                    </div>
                </div>
                <div class='review-page-container'> 
                </div>
            </div>
        </div>
        `
        res = new DOMParser().parseFromString(res , 'text/html').childNodes[0].childNodes[1].childNodes[0];
        res.querySelector('.review-page-container').replaceChildren(this.reviewItem.getHtmlRender());


        // activation des indicateurs
        var indicatorButtons = res.getElementsByClassName("indicator-menu-item");
        for (var i = 0; i < indicatorButtons.length; i++) {
            indicatorButtons[i].addEventListener('click', function(event) {
                var indicatorId = event.target.getAttribute('indicator-id');
                this.onClickUpdateIndicator(indicatorId);
            }.bind(this));
        }

        return res;
    }

    display(){
        this.reviewItem.selectTab(this.currentTab[0], this.currentTab[1]);
        //this.reviewItem.display();
    }

    onClickUpdateIndicator(indicatorId){
        this.currentIndicator = indicatorId;
        this.reviewItem.selectTab(this.currentTab[0], this.currentTab[1]);
    }
 
}

export class ReviewItem{
    constructor(review){
        this.review =  review;
        this.chart = null;
    }
    selectTab(graphType, graphSubject){
        console.log("SELECT TAB");
        var foodConsumptions = this.review.challengeDetails.foodConsumptions;
        var dayConsumptions = this.review.challengeDetails.dayConsumptions;
        
        var foods = this.review.challengeDetails.foods;
        var indicators = this.review.challengeDetails.challenge.challengeManager.indicators;

        var indicatorValues = {};
        foodConsumptions.forEach((foodConsumption) => {
            indicatorValues[foodConsumption.food_consumption_id] = this.review.computeIndicator.compute(indicators, foodConsumption, foods);
        })

        var functionToCall = CONFIG.content.tabs[graphType][graphSubject].fonction;

        var newData = functionToCall.call(
            dataGenerator, dayConsumptions, foodConsumptions, foods, indicatorValues, this.review.currentIndicator
        );
        
        this.data = newData;
        console.log("this.data");
        console.log(this.data);

        // on déséléctionne toutes les tabs
        var tabs = document.querySelectorAll('.review-item-tab-active');
        tabs.forEach((tab) => {
            tab.classList.remove('review-item-tab-active');
        })

        // on sélectionne celle courante
        document.querySelector('#'+graphType+'-'+graphSubject).classList.add('review-item-tab-active');
        document.querySelector('#'+graphType).classList.add('review-item-tab-active');

        if(graphType== 'stackedColumn'){
            var graph = new ReviewGraphStackedColumn(this, this.data, this.data.title, this.data.yaxisText);
        }
        else if (graphType == 'polarArea'){
            var graph = new ReviewGraphPolarArea(this, this.data, this.data.title);
        }

        this.addGraph(graph, document.querySelector('.review-graph'));
        feather.replace();
        // retirer ce display ?
        this.display();

        // on update les informations dans le Review
        this.review.currentTab = [graphType, graphSubject];

    }
    display(){
        console.log("ReviewItem display");
        this.chart.display();
        feather.replace();
    }
    addGraph(graph, reviewItem){
        console.log("ReviewItem addGraph");
        var res = graph.getHtmlRender();
        reviewItem.replaceChildren(
            res
        )
        this.chart = graph;
    }
    getHtmlRender(){
        var currentTab = this.review.currentTab; //['stackedColumn', 'Repas'];
        
        var currentGraphType = currentTab[0];
        var currentGraphSubject = currentTab[1];
        var configTabs = CONFIG.content['tabs'];
        var logos = CONFIG.logos;

        console.log("LOGOS : ", logos);

        var res = `
            <div class="review-container">
                <div class = "review-item-tab-row">
                </div>  
                <div class = "review-graph">
                </div>                  
            </div>
        `;
        var reviewItem = new DOMParser().parseFromString(res , 'text/html').childNodes[0].childNodes[1].childNodes[0];

        /* Ajout des différents tabs accessibles*/
        console.log(CONFIG);
        var graphTypes =  Object.keys(CONFIG.content['tabs']);

        graphTypes.forEach((graphType) => {
            var graphSubjects = Object.keys(configTabs[graphType])
            var isDefaultActive =  ((graphType===currentGraphType))? 'review-item-tab-active' : ''

            // On crée d'abord une colonne dans la ligne.
            var container_tab_res = `<div class="review-item-tab-col">
                <div class="review-item-tab-logo ${isDefaultActive}" id="${graphType}">
                    <i data-feather="${logos[graphType]}" color="${isDefaultActive} ? 'white' : 'black'" class="icon-button"></i>
                </div>
                <div class="review-item-tab-name"></div>
            </div>`
            var container_tab_res = new DOMParser().parseFromString(container_tab_res , 'text/html').childNodes[0].childNodes[1].childNodes[0];

            graphSubjects.forEach((graphSubject) => {
                var isDefaultActive =  ((graphType===currentGraphType) && (graphSubject===currentGraphSubject))? 'review-item-tab-active' : ''
                var tab_res = `<button type="button" class="review-item-tab ${isDefaultActive}" id="${graphType}-${graphSubject}">${graphSubject}</button>`
                var tab_res = new DOMParser().parseFromString(tab_res , 'text/html').childNodes[0].childNodes[1].childNodes[0];
                container_tab_res.querySelector('.review-item-tab-name').appendChild(tab_res);
            })
            reviewItem.querySelector('.review-item-tab-row').appendChild(container_tab_res);
        })

        /* Activation des boutons du bandeau pour sélection d'un nouveau type de graph ou d'un nouveau sujet de graph*/
        var graphTypes =  Object.keys(configTabs);
        graphTypes.forEach((graphType) => {
            var graphSubjects = Object.keys(configTabs[graphType]);
            graphSubjects.forEach((graphSubject) => {
                reviewItem.querySelector('#'+graphType+'-'+graphSubject).addEventListener(
                    "click",
                    this.selectTab.bind(this, graphType, graphSubject)
                );
            })
            
        })

        feather.replace();
        return reviewItem;
    }
}

export class ReviewGraph{
    constructor(parent, data, title, yaxisText){
        this.reviewItem = parent;
        this.data = data;
        this.title = title;
        var challengeManager = this.reviewItem.review.challengeDetails.challenge.challengeManager;
        this.currentIndicator = 
        this.indicators = challengeManager.indicators;
        this.ylabel = 
        this.chart = null;
        this.yaxisText =  yaxisText;
    }
    display(){
        console.log("display"); 
        // TODO : utiliser cette unité

        this.chart.render();
    }
    updateData(newData){
        this.data = newData;
        this.chart.updateSeries(this.data.series);
        this.chart.updateOptions({
            chart: {
                id: this.data.title
            },
            title: {
                text: this.data.title
            },
            labels : this.data.categories
        })
    }
}

export class ReviewGraphStackedColumn extends ReviewGraph{
    constructor(parent, data, title, yaxisText){
        super(parent, data, title, yaxisText);
    }
    
    getHtmlRender(){
        var res = `
            <div class = 'review-graph'>
            </div>
        `
        var res = new DOMParser().parseFromString(res , 'text/html').childNodes[0].childNodes[1].childNodes[0];

        var challengeManager = this.reviewItem.review.challengeDetails.challenge.challengeManager;
        var unit = challengeManager.indicators[this.reviewItem.review.currentIndicator]['unit'];

        var options = {
            series: this.data.series,
            chart: {
                id: this.title,
                type: 'bar',
                height:300,
                width:'100%',
                stacked: true,
                toolbar: {
                    show: true
                },
                zoom: {
                    enabled: true
                }
            },
            responsive: [{
                breakpoint: 480,
                options:{
                    plotOptions: {
                        bar: {
                            horizontal: true
                        }
                    },
                    legend: {
                        position: "bottom"
                    }
                }
            }],
            title: {
                text: this.title,
                align: 'center',
            },
            plotOptions: {
                bar: {
                    horizontal: false,
                    borderRadius: 10,
                    dataLabels: {
                        total: {
                        enabled: true,
                        style: {
                            fontSize: '13px',
                            fontWeight: 900
                        },
                        formatter: function(val, opt) {
                            return val.toFixed(2)
                        },
                        }
                    }
                },
            },
            xaxis: {
                categories: this.data.categories,
            },
            yaxis:{
                forceNiceScale : true,
                decimalsInFloat : 2,
                title: {
                    text: unit
                }
            },
            legend: {
                position: 'bottom',
            },
            fill: {
                opacity: 1
            }
          };

        
  
        this.chart = new ApexCharts(res, options);
        return res
    }
}

export class ReviewGraphPolarArea extends ReviewGraph{
    constructor(parent, data, title){
        super(parent, data, title);
    }
    getHtmlRender(){
        var res = `
            <div class = 'review-graph'>
            </div>
        `
        var res = new DOMParser().parseFromString(res , 'text/html').childNodes[0].childNodes[1].childNodes[0];
        
        var challengeManager = this.reviewItem.review.challengeDetails.challenge.challengeManager;
        var unit = challengeManager.indicators[this.reviewItem.review.currentIndicator]['unit'];


        var options = {
            id: this.title,
            series: this.data.series,
            labels : this.data.categories,
            plotOptions: {
                pie: {
                    donut: {
                        labels: {
                        show: true,
                        total: {
                            showAlways: true,
                            show: true,
                            formatter: function (w) {
                                return w.globals.seriesTotals.reduce((a, b) => {
                                return a + b
                                }, 0).toFixed(2) + " "+unit;
                            }
                        },
                        }
                    }
                },
                
            },
            chart: {
                type: 'donut',
                height: 315,
            },
            title: {
                text: this.title,
                align: 'center',
            },
            stroke: {
                colors: ['#fff']
            },
            fill: {
                opacity: 0.8
            },
            legend: {
                position: 'bottom'
            },
            responsive: [{
                breakpoint: 480,
                options: {
                    chart: {
                        height : 400
                    },
                    legend: {
                        position: 'bottom'
                    }
                }
            }]
          };
        
        this.chart = new ApexCharts(res, options);

        return res
    }
}

