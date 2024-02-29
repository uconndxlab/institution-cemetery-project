const cemeterylist = document.querySelector('#cemeteries-list');
const filterButton = document.querySelector('#filter-toggle')
const filterTags = document.querySelector('.filter-tags')
const mapPopUp = document.querySelector('#map-popup')
const cemeteryImage = document.querySelector('#cemeteryImage')
const searchForm = document.querySelector("#search-form")
/*setup mapbox*/
mapboxgl.accessToken = 'pk.eyJ1IjoidGhlbmF0YXR0YWNrIiwiYSI6ImNscHZsbnQ1eTA1ZWsyam54eDEyaWJxZmEifQ.wHJKEX_kIr4v6ouiydlwRw';
const map = new mapboxgl.Map({
  container: 'map', // container ID
  center: [-77.5, 41], // starting position [lng, lat]
  zoom: 6 // starting zoom
});

map.addControl(new mapboxgl.NavigationControl());

//clear current map, get data, put data into array, map data
var currentMarkers = []

filterButton.addEventListener('click', function () {
  if (filterTags.style.display === "none") {
    filterTags.style.display = "block"
  }
  else {
    filterTags.style.display = "none"
  }
})

//all cemeteries
var cemeteries = []

//alphabetically sort cemeteries by title
cemeteries.sort(function (a, b) {
  if (a.title < b.title) { return -1; }
  if (a.title > b.title) { return 1; }
  return 0
})

async function getAllCemeteries() {
  const response = await fetch('https://institution-cemetery-project-json.npkn.net/institution-cemetery-json/');
  return await response.json();
}

const renderList = cemeteries => {
  if (currentMarkers != null) {
    for (var i = currentMarkers.length - 1; i >= 0; i--) {
      currentMarkers[i].remove();
    }
  }
  cemeterylist.innerHTML = '';
  cemeteries.forEach(element => {
    // var resourcelabel = document.createElement("p")
    // resourcelabel.classList.add("cemetery-label")
    // for (var i = 0; i < element["tags"].length; i++) {
    //   var resourcelabelspan = document.createElement("span")
    //   resourcelabelspan.innerHTML = element["tags"][i]
    //   resourcelabel.appendChild(resourcelabelspan)
    // }
    // var resourcetitle = document.createElement("h2")
    // resourcetitle.innerHTML = element["name"]
    // var resourcestate = document.createElement("p")
    // resourcestate.innerHTML = element["state"]
    // var listresource = document.createElement("li")
    // listresource.appendChild(resourcelabel)
    // listresource.appendChild(resourcetitle)
    // listresource.appendChild(resourcestate)
    // listresource.classList.add("cemetery-block")
    // document.querySelector('#cemeteries-list').appendChild(listresource)
    // marker.addEventListener("click", readMore())
    //add to map
    var el = document.createElement('div');
    el.className = 'marker-red';
    var marker = new mapboxgl.Marker(el)
    .setLngLat([Number(element["longitude"]), Number(element["latitude"])])
      // .setPopup(
      //   new mapboxgl.Popup() // add popups
      //     .setHTML(
            

      //       `<button class="read-more-button" id=`
      //       + element["id"] +
      //       ` onclick="readMore()">Read More</button>`
      //     )
      // )
      .addTo(map);
      let markerel = marker.getElement()
        markerel.addEventListener('click', () => {
          filterTags.style.diplay = "flex"
          mapPopUp.style.display = "flex"
          mapPopUp.style.transform = "translateX(400px)"
          mapPopUp.style.transition = ".75s"
          mapPopUp.style.transitionTimingFunction = "ease"
          cemeteryImage.innerHTML =
            `
            <div class="pop-up-container" style="position:relative">
            <button onclick="closeModal()" class="close-button" style="position:absolute;"><i class="fa-solid fa-x"></i></button>
            <div>
            <img class="pop-up-image" src='${element.feat_img}'>
            <h1>${element.name}</h1>
            <h3>${element.city}, ${element.state}</h3>
            <h4>Number of Graves: ${element.number_of_graves}</h4>
            <h4>Years of Operation: ${element.years_of_operation}</h4>
            </div>
            <div class="cemetery-information" style="height: min-content">
            <p style="padding: 0">${element.description}</p>
            </div>
            </div>`
    })
    
    currentMarkers.push(marker)
  })
}

//filtered array of cemeteries
var filteredArray = []

var filtersArray = []

//how categories are filtered using .filter
var filtercode = {
  'tags': 'filtersArray["tags"].some(r=> element.tags.includes(r))',
  'state': 'element.state === filtersArray["state"]'
}

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
      : choices.splice(choices.indexOf(category.value), 1);
    //console.log(choices)
    //console.log(filteredArray)
    if (choices.length > 0) {
      filtersArray["tags"] = choices
    }
    else {
      delete filtersArray["tags"]
    }
    filterCemeteries()
  })

  //place the state into filtersArray
  var stateoption = document.getElementById('state')
  stateoption.onchange = statefilter
  function statefilter() {
    if (stateoption.value == 'all') {
      delete filtersArray["state"]
    }
    else {
      filtersArray["state"] = stateoption.value
    }
    filterCemeteries()
  }

  // Run a keyword search
  // document.querySelector('#search-btn').addEventListener('click', function(e) {
  //   e.preventDefault()
  //   if (document.querySelector('#search-bar').value.length !== 0){
  //   keywordSearch()}
  //   else{
  //     loadCemeteries()
  //   }
  // })

  searchForm.addEventListener('change', function(e) {
    e.preventDefault()
    if (document.querySelector('#search-bar').value.length !== 0){
    keywordSearch()}
    else{
      loadCemeteries()
    }
  })

  document.querySelector('#search-btn').addEventListener('click', function(e) {
    e.preventDefault()
    if (document.querySelector('#search-bar').value.length !== 0){
    keywordSearch()}
    else{
      loadCemeteries()
    }
  })

  async function keywordSearch(){
    cemeteries = [];
    const query = document.querySelector('#search-bar').value;
    console.log(query)
    let allCemeteries= await this.getAllCemeteries();
    allCemeteries.forEach(listing => {
      if(listing.name.toLowerCase().indexOf(query.toLowerCase()) !== -1 ||
      listing.description.toLowerCase().indexOf(query.toLowerCase()) !== -1){
          cemeteries.push(listing)
      }
    });
    filterCemeteries();
  }


  //using filtersarray, filter the cemeteries and put into filtereedarray
  //take the first filter from filtercode then add additional features with && to hand to the .filter function
  function filterCemeteries() {
    if (Object.keys(filtersArray).length > 0) {
      var combinedfilter = filtercode[Object.keys(filtersArray)[0]]
      for (var i = 1; i < Object.keys(filtersArray).length; i++) {
        combinedfilter += '&&' + filtercode[Object.keys(filtersArray)[i]]
      }
      filteredArray = cemeteries.filter(element =>
        eval(combinedfilter))
    }
    else {
      filteredArray = cemeteries
    }
    renderList(filteredArray)
  }
})

function closeModal() {
  mapPopUp.style.transform = "translateX(0px)"
  mapPopUp.style.transition = ".75s"
}

// Stuff to run when the DOM is ready
window.addEventListener('DOMContentLoaded', async () => {
  cemeteries = await getAllCemeteries()
  renderList(cemeteries)

})

window.addEventListener("DOMContentLoaded", () => loadCemeteries(), false);

async function loadCemeteries() {
  cemeteries = await getAllCemeteries()
  renderList(cemeteries)
}