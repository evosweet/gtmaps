//init map
var map = new google.maps.Map(document.getElementById('map'), {
    zoom: 13,
    center: new google.maps.LatLng(6.80448, -58.15527),
    mapTypeId: google.maps.MapTypeId.ROADMAP
});
// search filter search box
var autoSearch = new google.maps.places.SearchBox(
    document.getElementById('autoSearch')
);
autoSearch.setBounds(map.getBounds());

// places markers
var placesMarkers = [];

function hideMarkers(markers){
    for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(null);
    }
}

// set up each point on the map
function point(name, lat, long, custInfo) {
    this.name = name;
    this.lat = ko.observable(lat);
    this.long = ko.observable(long);
    this.custInfo = ko.observable(custInfo);

    var largeInfowindow = new google.maps.InfoWindow();

    var marker = new google.maps.Marker({
        position: new google.maps.LatLng(lat, long),
        animation: google.maps.Animation.DROP,
        title: name,
        map: map,
        draggable: true
    });

    //if you need the poition while dragging
    google.maps.event.addListener(marker, 'drag', function () {
        var pos = marker.getPosition();
        this.lat(pos.lat());
        this.long(pos.lng());
    }.bind(this));

    //if you just need to update it when the user is done dragging
    google.maps.event.addListener(marker, 'dragend', function () {
        var pos = marker.getPosition();
        this.lat(pos.lat());
        this.long(pos.lng());
    }.bind(this));

    //add marker click event
    marker.addListener('click', function () {
        populateInfoWindow(this, largeInfowindow, custInfo);
        //make marker bounce on click
        toggleBounce(marker);
    });

}

function populateInfoWindow(marker, InfoWindow, custInfo) {
    InfoWindow.setContent('<div>' + marker.title + '</div><div id="pano">' + custInfo + '</div>');
    InfoWindow.open(map, marker);
    console.log("this ran");
}

function toggleBounce(marker) {
    if (marker.getAnimation() !== null) {
        marker.setAnimation(null);
    } else {
        marker.setAnimation(google.maps.Animation.BOUNCE);
    }
}

autoSearch.addListener('places_changed',function(){
    searchBoxPlaces(this);
});

 function searchBoxPlaces(placeMarker){
     hideMarkers(placeMarker);
     var places = autoSearch.getPlaces();
     createMakersForPlaces(places);
 }


// zoom to selected area 
zoomToArea = function () {
   var bounds = map.getBounds();
   hideMarkers(placesMarkers);
   var placesService = new google.maps.places.PlacesService(map);
   placesService.textSearch({
       query:document.getElementById('autoSearch').value,
       bounds: bounds}, function(results, status){
           createMakersForPlaces(results);
       });
}

 function createMakersForPlaces(places){
     var bounds = new google.maps.LatLngBounds();
     for (var i = 0; i < places.length; i++) {
       var place = places[i];
       var icon = {
           url: place.icon,
           size: new google.maps.Size(35,35),
           origin: new google.maps.Point(0,0),
           anchor: new google.maps.Point(15,34),
           scaledSize: new google.maps.Size(25,25)
       };
      //create icon
      var marker = new google.maps.Marker({
        map: map,
        icon: icon,
        title:place.name,
        position: place.geometry.location,
        id: place.place_id
      });
      // create info window
      var placesInfoWindow = new google.maps.InfoWindow()
      // add event tp marker
      marker.addListener('click', function(){
        if(placesInfoWindow.marker == this){
            console.log("this infowindow already is on this ,marker");
        }else{
            getPlacesDetails(this, placesInfoWindow);
        }
      });
      //push marker data
      placesMarkers.push(marker);
      if(place.geometry.viewport){
          bounds.union(place.geometry.viewport);
      }else{
          bounds.extend(places.geometry.location);
      }
     }
     map.fitBounds(bounds);
 }

 function getPlacesDetails(marker,infowindow){
     var service = new google.maps.places.PlacesService(map);
     console.log(marker.id);
     service.getDetails({
        placeId: marker.id
     }, function(place, status){
         if (status === google.maps.places.PlacesServiceStatus.OK){
             infowindow.marker = marker;
             var innerHTML = '<div>';
             if(place.name){
                 innerHTML += '<strong>'+ place.name +'</strong>';
             }
             innerHTML += '</div>';
             infowindow.setContent(innerHTML);
             infowindow.open(map,marker);
             console.log("this is going yo take a while");
         }else{
             console.log("this is a test for no name");
         }
     });
 }


var viewModel = {
    //autoAddress: ko.observable(),
    // onload default points
    points: ko.observableArray([
        new point('Park', 6.8214123, -58.1515635, 'good for a run'),
        new point('Seawall Band Stand', 6.82515163463196, -58.15879497783209, 'if you like salt water'),
        new point('Botanical Gardens', 6.806412798079851, -58.145383690429696, 'nice for walk'),
        new point('Guyana Defence Force', 6.82217930736949, -58.14581284387208, 'army base')
    ]),

};

ko.applyBindings(viewModel);