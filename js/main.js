const cemeterylist = document.querySelector('#cemeteries-list');
// const filterButton = document.querySelector('.filter-button')
const filterTags = document.querySelector('.filter-tags')
const searchForm = document.querySelector("#search-form")
/*setup mapbox*/
mapboxgl.accessToken = 'pk.eyJ1IjoidGhlbmF0YXR0YWNrIiwiYSI6ImNscHZsbnQ1eTA1ZWsyam54eDEyaWJxZmEifQ.wHJKEX_kIr4v6ouiydlwRw';
const map = new mapboxgl.Map({
  container: 'map', // container ID
  center: [-77.5, 41], // starting position [lng, lat]
  zoom: 6 // starting zoom
});

map.addControl(new mapboxgl.NavigationControl());
map.setStyle('mapbox://styles/uconndxgroup/clua5v1ze01ih01nwfjod29sl')

//clear current map, get data, put data into array, map data
var currentMarkers = []

// // Filter button toggle display
// filterButton.addEventListener('click', function () {
//   if (filterTags.style.display === "none") {
//     filterTags.style.display = "none"

//     mapPopUp.style.transform = "translateX(50vw)"
//     filterTags.style.display = "block"
//     cemeteryPopUp.style.display = "none"

//  }
//   else {
//     filterTags.style.display = "none"
    
//   }
// })

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
    //Toggle markers to be either beige when innactive or white when active
    var el = document.createElement('div');
    el.classList.add('marker-red');

    el.addEventListener('click', function(e){
      var x = document.getElementsByClassName("marker-red");
      var i;
      for (i = 0; i < x.length; i++) {
        x[i].classList.add(('marker-red')) // set "marker" as the class for each of those elements
        x[i].classList.remove(('marker-red-clicked'))
      }
      this.classList.add('marker-red-clicked','marker-red', "mapboxgl-marker", "mapboxgl-marker-anchor-center");
     })

    var marker = new mapboxgl.Marker(el)
    .setLngLat([Number(element["longitude"]), Number(element["latitude"])])
    .setPopup(
      new mapboxgl.Popup({ offset: 25 }) // add popups
      .setHTML(
            `
            <img class="pop-up-image" src='${element.feat_img}'>
            <h3>${element.name}</h3>
            <p><strong>${element.city}, ${element.state}</strong></p>
            <p>Number of Graves: ${element.number_of_graves}</p>
            <p>Years of Cemetery Operation: ${element.years_of_operation}</p>
            <p style="margin-top:10px;"><a href="${element.link}">Learn More</a><p>`
    )
    )
    .addTo(map);
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

  //preventing search button from submitting when click enter
  searchForm.addEventListener('change', function(e) {
    e.preventDefault()
    if (document.querySelector('#search-bar').value.length !== 0){
    keywordSearch()}
    else{
      loadCemeteries()
    }
  })

  //refreshing cemeteries when new values are added to the search button and enter is clicked
  searchForm.addEventListener('submit', function(e) {
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

// //slide out transition when x button is clicked on side bar menu
// function closeModal() {
//   mapPopUp.style.transform = "translateX(-100px)"
//   mapPopUp.style.transition = ".75s"
// }

// function closeFilterModal() {
//   filterTags.style.display = "none"
// }


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