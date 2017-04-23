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


var map = new google.maps.Map(document.getElementById('map'), {
    zoom: 13,
    center: new google.maps.LatLng(6.80448, -58.15527),
    mapTypeId: google.maps.MapTypeId.ROADMAP
});

var viewModel = {
    points: ko.observableArray([
        new point('Park', 6.8214123, -58.1515635, 'good for a run'),
        new point('Seawall Band Stand', 6.82515163463196, -58.15879497783209, 'if you like salt water'),
        new point('Botanical Gardens', 6.806412798079851, -58.145383690429696, 'nice for walk'),
        new point('Guyana Defence Force', 6.82217930736949, -58.14581284387208, 'army base')
    ])
};

ko.applyBindings(viewModel);