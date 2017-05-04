//init
$(document).ready(function () {

    function viewModel() {
        var self = this;
        //init searchBox
        self.autoAddress = ko.observable("");
        //init places array
        self.placesMarkers = ko.observableArray([]);

        //
        self.placeTitle = ko.observable();
        self.placeAddress = ko.observable();
        self.placePhone = ko.observable();
        self.placeWebsite = ko.observable();
        self.urlTitle = ko.observable();
        //
        //init map
        var map = new google.maps.Map(document.getElementById('map'), {
            zoom: 13,
            center: new google.maps.LatLng(6.80448, -58.15527),
            mapTypeId: google.maps.MapTypeId.ROADMAP
        });
        var autoSearch = new google.maps.places.SearchBox(
            document.getElementById('autoSearch')
        );
        //get map bounds
        var bounds = map.getBounds();
        //call google places service
        var placesService = new google.maps.places.PlacesService(map);

        function createMakersForPlaces(places) {
            //init marker array 
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
                    id: place.place_id,
                    animation: google.maps.Animation.DROP
                });
                // create info window
                var placesInfoWindow = new google.maps.InfoWindow();
                // toggle marker
                // add marker animation
                // add event tp marker
                marker.addListener('click', function () {
                    map.setCenter(this.getPosition());
                    getPlacesDetails(this, placesInfoWindow);
                    toggleBounce(this);
                });

                self.placesMarkers.push(marker);
                if (place.geometry.viewport) {
                    bounds.union(place.geometry.viewport);
                } else {
                    bounds.extend(places.geometry.location);
                }
            }
            map.fitBounds(bounds);
        }
        //end
        function toggleBounce(marker) {
            if (marker.getAnimation() !== null) {
                marker.setAnimation(null);
            } else {
                marker.setAnimation(google.maps.Animation.BOUNCE);
                setTimeout(function(){ marker.setAnimation(null); }, 1000);
            }
        }

        //get places data
        function getPlacesDetails(marker, infowindow) {
            var service = new google.maps.places.PlacesService(map);
            self.getDetails(marker);
            console.log();
            service.getDetails({
                placeId: marker.id
            }, function (place, status) {
                if (status === google.maps.places.PlacesServiceStatus.OK) {
                    infowindow.marker = marker;
                    var innerHTML = '<div>';
                    if (place.name) {
                        innerHTML += '<strong>' + self.placeTitle() + '</strong>';
                    }
                    if (place.formatted_address) {
                        innerHTML += '<br>' + "Full Address " + self.placeAddress();
                    }
                    if (place.formatted_phone_number) {
                        innerHTML += '<br>' + "Phone Number " + self.placePhone();
                    }
                    if (place.website) {
                        innerHTML += '<br>' + "Website " + place.website;
                    }

                    innerHTML += '</div>';
                    infowindow.setContent(innerHTML);
                    infowindow.open(map, marker);
                } else {
                    console.log("erorr");
                }
            });
        }
        //end

        //places services
        self.getDetails = function(marker){
            service = new google.maps.places.PlacesService(map);
            service.getDetails({
                placeId: marker.id
            },function(place, status){
                if (status === google.maps.places.PlacesServiceStatus.OK) {
                   self.placeTitle(place.name); 
                   self.placeAddress(place.formatted_address);
                   self.placePhone(place.formatted_phone_number);
                   if (place.website){
                        self.placeWebsite(place.website);
                        self.urlTitle("Click On Me");
                   }else{
                        self.urlTitle("No Link");
                   }
                }
            });
        };

        self.setLocation = function (marker) {
            self.getDetails(marker);
            map.setCenter(marker.getPosition());
            toggleBounce(marker);
        };
        // hide all markers
        function hideMarkers(markers) {
            for (var i = 0; i < markers.length; i++) {
                markers[i].setMap(null);
            }
        }
        // generate new markers from search
        self.newPlaces = function () {
            hideMarkers(self.placesMarkers);
            self.placesMarkers.removeAll();
            if (!self.autoAddress()) {
                searchTeam = 'Georgetown Guyana food';
            } else {
                searchTeam = self.autoAddress();
            }
            placesService.textSearch({
                query: searchTeam,
                bounds: bounds
            }, function (results, status) {
                createMakersForPlaces(results);
            });
        }
        self.newPlaces();
    }
    ko.applyBindings(new viewModel());
});