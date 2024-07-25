
export class NewManager{
    constructor(){
      this.news = [];
      this.loadNews();
    }
    loadNews(){
        // Load de tous les challenges existants
        let initObject = {
            method: 'GET',
            headers: {
                "Content-Type": "application/json",
            },
        }
        
        fetch('/api/new', initObject)
            .then(response => 
                    response.json()
            )
            .then((news) => {
                // mise à jour de la liste des challenges.
                    news.forEach(_new => {
                        console.log(_new)
                        var newNew = new New(this, _new)
                        document.querySelector('#news-container').appendChild(
                            newNew.getHtmlRender()
                        );
                        feather.replace();
                    });
                }
            )
            .catch(error => console.error(error));    
    }
}

function formatDate(dateString) {
    // Create a new Date object from the provided string
    const date = new Date(dateString);
    
    // Define month names in French
    const months = [
      "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
      "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
    ];
  
    // Get the day, month, and year from the date object
    const day = date.getDate();
    const monthIndex = date.getMonth();
    const year = date.getFullYear();
  
    // Add "er" suffix for 1st day
    const daySuffix = (day === 1) ? "er" : "";
  
    // Format the date in the desired format
    const formattedDate = day + daySuffix + " " + months[monthIndex] + " " + year;
  
    return formattedDate;
  }
  
export class New{
    constructor(parent, data){
        this.NewManager = parent;
        this.data = data;
    }
    getHtmlRender(){
        var res = `
            <div class="news-item">
                <div class = "news-item-date">
                    ${formatDate(this.data['creation_date'])}
                </div>
                <div class = "news-item-title">
                    ${this.data['title']}
                </div>
                <div class = "news-item-text">
                    ${this.data['text']}
                </div>
            </div>
          `
        res = new DOMParser().parseFromString(res , 'text/html').childNodes[0].childNodes[1].childNodes[0];
        return res;
    }
}

const new_manager = new NewManager();
