const cemeterylist = document.querySelector('#cemeteries-list');

//all cemeteries
var cemeteries = []

  //alphabetically sort cemeteries by title
cemeteries.sort(function(a,b){
    if (a.title < b.title) {return -1;}
    if (a.title > b.title) {return 1;}
    return 0
})

async function getAllCemeteries(){
  const response = await fetch('https://institution-cemetery-project-json.npkn.net/institution-cemetery-json/');
  return await response.json();
}

//display cemeteries
const renderList = cemeteries => {
  cemeterylist.innerHTML = '';
    cemeteries.forEach(element => {
        var resourcelabel = document.createElement("p")
        resourcelabel.classList.add("cemetery-label")
        for (var i=0; i<element["tags"].length;i++){
          var resourcelabelspan = document.createElement("span")
          resourcelabelspan.innerHTML = element["tags"][i]
          resourcelabel.appendChild(resourcelabelspan)
        }
        //var resourcelinklink = document.createElement("a")
        //resourcelinklink.href = element["link"]
        var resourcetitle = document.createElement("h2")
        resourcetitle.innerHTML = element["name"]
        //var resourcename = document.createElement("h4")
        //resourcename.innerHTML = element["firstname"]+" "+element["lastname"]
        //var resourcesnippet = document.createElement("p")
        //resourcesnippet.innerHTML = element["snippet"]
        var resourcestate = document.createElement("p")
        resourcestate.innerHTML = element["state"]
        var listresource = document.createElement("li")
        //var resourceimage = document.createElement("img")
        //resourceimage.src = element["img"]
        //resourcelinklink.appendChild(resourceimage)
        listresource.appendChild(resourcelabel)
        listresource.appendChild(resourcetitle)
        //listresource.appendChild(resourcename)
        listresource.appendChild(resourcestate)
        //resourcelinklink.appendChild(resourcesnippet)
        //listresource.appendChild(resourcelinklink)
        listresource.classList.add("cemetery-block")
        document.querySelector('#cemeteries-list').appendChild(listresource)
    })
  }

  //filtered array of cemeteries
  var filteredArray = []

  //array of filters to apply
  var filtersArray = []

  //how categories are filtered using .filter
  var filtercode = {'tags':'filtersArray["tags"].some(r=> element.tags.includes(r))',
                    'state':'element.state === filtersArray["state"]'}

  //filter categories
  let choices = [];
  let stateoption = "";
  const categories = document.querySelectorAll('.category');
  const red = '(filtersArray["tags"].some(r=> element.tags.includes(r)) && element.state === filtersArray["state"]'

  //place the categories into an array within filtersArray
  categories.forEach(category => {
    category.addEventListener('change', () => {
        category.checked ? 
        choices.push(category.value)
        : choices.splice(choices.indexOf(category.value), 1 );
      //console.log(choices)
      //console.log(filteredArray)
      if (choices.length > 0){
        filtersArray["tags"] = choices
      }
      else{
        delete filtersArray["tags"]
      }
      filterCemeteries()
    })
  
//place the state into filtersArray
  var stateoption = document.getElementById('state')
  stateoption.onchange = statefilter
  function statefilter(){
        if (stateoption.value == 'all'){
            delete filtersArray["state"]
        }
        else{
            filtersArray["state"] = stateoption.value
        }
        filterCemeteries()
    }


    //using filtersarray, filter the cemeteries and put into filtereedarray
    //take the first filter from filtercode then add additional features with && to hand to the .filter function
    function filterCemeteries(){
        if (Object.keys(filtersArray).length>0){
            var combinedfilter = filtercode[Object.keys(filtersArray)[0]]
            for (var i=1; i < Object.keys(filtersArray).length; i++){
                combinedfilter += '&&'+filtercode[Object.keys(filtersArray)[i]]
            }
            filteredArray = cemeteries.filter(element => 
                eval(combinedfilter))
        }
        else{
            filteredArray = cemeteries
        }    
        renderList(filteredArray)
    }   
  })

  // Stuff to run when the DOM is ready
window.addEventListener('DOMContentLoaded', async () =>{
  cemeteries = await getAllCemeteries()
  renderList(cemeteries)

})



