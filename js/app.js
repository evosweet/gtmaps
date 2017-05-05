//init
// $(document).ready(function () {
function initMap() {
    'use strict';
    // ko view model
    function viewModel() {
        var self = this;
        //init searchBox
        self.autoAddress = ko.observable("");
        //init places array
        self.placesMarkers = ko.observableArray([]);
        //init on load
        self.placeTitle = ko.observable("");
        self.placeAddress = ko.observable("");
        self.placePhone = ko.observable("");
        self.placeWebsite = ko.observable("");
        self.urlTitle = ko.observable("");
        self.fourData = ko.observableArray([]);
        // custom map style
        var myStyles = [{
            featureType: "poi",
            elementType: "labels",
            stylers: [{
                visibility: "off"
            }]
        }];
        //init map 
        var map = new google.maps.Map(document.getElementById("map"), {
            zoom: 13,
            center: new google.maps.LatLng(6.80448, -58.15527),
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            styles: myStyles
        });
        //init auto search box 
        var autoSearch = new google.maps.places.SearchBox(
            document.getElementById("autoSearch")
        );
        //get map bounds
        var bounds = map.getBounds();
        //call google places service
        var placesService = new google.maps.places.PlacesService(map);

        function createMakersForPlaces(places) {
            // new map bounds for each marker
            bounds = new google.maps.LatLngBounds();
            // init each marker
            places.forEach(function (place) {
                // make icon
                var icon = {
                    url: place.icon,
                    size: new google.maps.Size(35, 35),
                    origin: new google.maps.Point(0, 0),
                    anchor: new google.maps.Point(15, 34),
                    scaledSize: new google.maps.Size(25, 25)
                };
                // place each marker on the map
                var marker = new google.maps.Marker({
                    map: map,
                    icon: icon,
                    title: place.name,
                    position: place.geometry.location,
                    id: place.place_id,
                    animation: google.maps.Animation.DROP
                });
                // add click event to each marker
                marker.addListener("click", function () {
                    map.panTo(marker.getPosition());
                    self.getDetails(this);
                    self.toggleBounce(this);
                    self.getFour(this);
                });
                // add markers to array
                self.placesMarkers.push(marker);
                if (place.geometry.viewport) {
                    bounds.union(place.geometry.viewport);
                } else {
                    bounds.extend(places.geometry.location);
                }
            });
            //
            google.maps.event.addDomListener(window, 'resize', function () {
                map.fitBounds(bounds);
            });
            map.fitBounds(bounds);
        }
        // toggle marker Animation
        self.toggleBounce = function (marker) {
            if (marker.getAnimation() !== null) {
                marker.setAnimation(null);
            } else {
                marker.setAnimation(google.maps.Animation.BOUNCE);
                setTimeout(function () {
                    marker.setAnimation(null);
                }, 1400);
            }
        };

        //get places data
        self.getPlacesDetails = function (marker) {
            self.getDetails(marker);
        };
        // Foursquear API DATA call
        self.getFour = function (maker) {
            var lat = maker.position.lat();
            var lng = maker.position.lng();
            var fourUrl = "https://api.foursquare.com/v2/venues/explore?v=20161016&ll=" + lat + "," + lng + "&client_id=N3Y3RPYUKPGUJDV43KSVKKIWQGUPQHHK2WVPRM1YBYJPZFH4&client_secret=WJLN1QFWK0AG4GU125BNMLG0JOLBWW14JDDORYU5ZKB3DNXR&limit=4";
            $.getJSON(fourUrl, function (data) {
                // get json data
            }).done(function (data) {
                self.fourData(data.response.groups[0].items);
            }).fail(function () {
                alert("ERROR Accessing External API");
            });
        };
        //places services
        self.getDetails = function (marker) {
            var service = new google.maps.places.PlacesService(map);
            service.getDetails({
                placeId: marker.id
            }, function (place, status) {
                if (status === google.maps.places.PlacesServiceStatus.OK) {
                    self.placeTitle(place.name);
                    self.placeAddress(place.formatted_address);
                    self.placePhone(place.formatted_phone_number);
                    if (place.website) {
                        self.placeWebsite(place.website);
                        self.urlTitle("Click On Me");
                    } else {
                        self.urlTitle("No Link");
                    }
                } else {
                    alert("Google API ERROR");
                }
            });
        };
        // update page when list item is clicked
        self.setLocation = function (marker) {
            self.getDetails(marker);
            self.getFour(marker);
            self.toggleBounce(marker);
            map.setCenter(marker.getPosition());
        };
        // hide all markers
        self.hideMarkers = function (markers) {
            markers.forEach(function (marker) {
                marker.setMap(null);
            });
        };
        // generate new markers from search
        self.newPlaces = function () {
            // init search term
            var searchTeam = '';
            self.hideMarkers(self.placesMarkers());
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
        };
        //toggle list
        self.toggleList = function () {
            $("#wrapper").toggleClass("toggled");
        };
        self.newPlaces();
    }
    ko.applyBindings(new viewModel());

    function googleError() {
        alert("Failed To Load Google API");
    }
}