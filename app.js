
var map, placesList, pyrmont, info;
var all_markers = [];
var current_marker, previous_marker;

function initialize() {

  // this is location of san francisco
  pyrmont = new google.maps.LatLng(37.7577, -122.4376);

  map = new google.maps.Map(document.getElementById('map-canvas'), {
    center: pyrmont,
    zoom: 12
  });

  info = new google.maps.InfoWindow();
}

/*
*   function to highlight marker when a restaurant is clicked form the list.
*   @param string Google Place ID
*/

function highlight_marker(place_id){

  console.log("highlighter called"+ place_id);

  for(i=0;i<all_markers.length;i++){

    if(all_markers[i].place_id == place_id)
      current_marker = all_markers[i].marker_obj;

  }

  if(previous_marker != null)
    previous_marker.setAnimation(null);

  current_marker.setAnimation(google.maps.Animation.BOUNCE);
  previous_marker = current_marker;
}

/*
*  This function collect all parameters from form fields, prepares 
*  JSON parameters and makes a places API search
*/
function search(){


  // remove all markers from the map. Useful when a new search is made 

  for(i=0;i<all_markers.length;i++){

    all_markers[i].marker_obj.setMap(null);

  }

  // hide the placeholder text and remove previous results from the list
  var placetext = document.getElementById("placeholder-text");
  if(placetext) placetext.innerHTML = "";
  
  placesList = document.getElementById('places');
  placesList.innerHTML = "";

  // prepare request object for place api search

  var request = {
    location: pyrmont,
    radius: 5000,
    types: ["restaurant"]
  };

  var keyword   = document.getElementById("keyword").value;
  var minprice  = document.getElementById("minprice").value;
  var maxprice  = document.getElementById("maxprice").value;
  var opennow   = document.getElementById("opennow").checked;

  if(keyword != "") 
    request.name  = keyword;
  
  request.minprice = minprice;
  request.maxprice = maxprice;

  if(opennow) request.opennow = true;

  console.log(request);

  
  // initialize the service 
  var service = new google.maps.places.PlacesService(map);
  service.nearbySearch(request, callback);
}

function callback(results, status, pagination) {
  if (status != google.maps.places.PlacesServiceStatus.OK) {
    return;
  } else {
    createMarkers(results);

    // if there is pagination enable more results button
    if (pagination.hasNextPage) {
      var moreButton = document.getElementById('more');
      moreButton.style.display = "block";
      moreButton.disabled = false;

      google.maps.event.addDomListenerOnce(moreButton, 'click',
          function() {
        moreButton.disabled = true;
        pagination.nextPage();
      });
    }
  }
}

/*
*  function to 
*  1. Populate Markers 
*  2. Populate results in list view
*  3. Attach click listeners to each list view item so marker can be highlighted
*/

function createMarkers(places) {
  var bounds = new google.maps.LatLngBounds();
  var place; 

  for (var i = 0; place = places[i]; i++) {

    // set marker image and dimensions 
    var image = {
      url: "marker.png",
      size: new google.maps.Size(80, 80),
      origin: new google.maps.Point(0, 0),
      anchor: new google.maps.Point(17, 34),
      scaledSize: new google.maps.Size(30, 30)
    };

    // create marker 
    var marker = new google.maps.Marker({
      map: map,
      icon: image,
      title: place.name,
      rating: place.rating,
      position: place.geometry.location
    });  
    
    // push all markers in an array for backward event binding
    all_markers.push({place_id:place.id, marker_obj:marker});

    // attach an event to the marker to show restaurant name 
    google.maps.event.addListener(marker, 'click', function() {

        info.setContent(this.title + "("+this.rating+")");
        info.open(map, this);

    });

    // popular the response in results UL
    placesList.innerHTML += '<li id="'+place.id+'"><div class="rest-name"><h5>' + place.name + '</h5><p>'+place.vicinity+'</p></div><span class="rating">'+place.rating+'</span></li>';

    // reposition map to show all markers 
    bounds.extend(place.geometry.location);
  }

  map.fitBounds(bounds);

  // bind click events on all li elements of the page
  var li = document.getElementsByTagName("li");

  for (var i = li.length - 1; i >= 0; i--) {
    li[i].addEventListener("click", function(){ highlight_marker(this.id); });
  };


}

// call initialize function when window is loaded 
google.maps.event.addDomListener(window, 'load', initialize);


