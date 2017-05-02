//init
$(document).ready(function () {

    function viewModel() {
        var self = this;

        self.placesMarkers = ko.observableArray([]);
        //init map
        var map = new google.maps.Map(document.getElementById('map'), {
            zoom: 13,
            center: new google.maps.LatLng(6.80448, -58.15527),
            mapTypeId: google.maps.MapTypeId.ROADMAP
        });
        //get map bounds
        var bounds = map.getBounds();
        //call google places service
        var placesService = new google.maps.places.PlacesService(map);
        // make first default search call
        placesService.textSearch({
            query: 'Georgetown Guyana Food',
            bounds: bounds
        }, function (results, status) {
            createMakersForPlaces(results);
        });
        // create places markers
        function createMakersForPlaces(places) {
            var bounds = new google.maps.LatLngBounds();
            for (var i = 0; i < places.length; i++) {
                var place = places[i];
                var icon = {
                    url: place.icon,
                    size: new google.maps.Size(35, 35),
                    origin: new google.maps.Point(0, 0),
                    anchor: new google.maps.Point(15, 34),
                    scaledSize: new google.maps.Size(25, 25)
                };
                //create icon
                var marker = new google.maps.Marker({
                    map: map,
                    icon: icon,
                    title: place.name,
                    position: place.geometry.location,
                    id: place.place_id
                });
                // create info window
                var placesInfoWindow = new google.maps.InfoWindow()
                // add event tp marker
                marker.addListener('click', function () {
                    if (placesInfoWindow.marker == this) {
                        console.log("this infowindow already is on this ,marker");
                    } else {
                        getPlacesDetails(this, placesInfoWindow);
                    }
                });
                //push marker data
                self.placesMarkers.push(marker);
                if (place.geometry.viewport) {
                    bounds.union(place.geometry.viewport);
                } else {
                    bounds.extend(places.geometry.location);
                }
            }
            map.fitBounds(bounds);
        }
        console.log(self.placesMarkers());
        //end
        self.setLocation = function(data){
            console.log(data);
        }
    }
    ko.applyBindings(new viewModel());
});