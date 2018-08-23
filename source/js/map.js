(function () {
  function initMap() {
    const centerLatLng = new google.maps.LatLng(59.927610, 30.347181);
    const markerLatLng = new google.maps.LatLng(59.927310, 30.347381);

    const mapOptions = {
      center: centerLatLng,
      zoom: 14,
      styles: [
        {
          "featureType": "all",
          "elementType": "all",
          "stylers": [
            {
              "visibility": "on"
            }
          ]
        },
        {
          "featureType": "administrative",
          "elementType": "labels.text.fill",
          "stylers": [
            {
              "color": "#3e91e4"
            }
          ]
        },
        {
          "featureType": "administrative.locality",
          "elementType": "all",
          "stylers": [
            {
              "visibility": "off"
            }
          ]
        },
        {
          "featureType": "administrative.neighborhood",
          "elementType": "all",
          "stylers": [
            {
              "visibility": "on"
            }
          ]
        },
        {
          "featureType": "landscape",
          "elementType": "all",
          "stylers": [
            {
              "color": "#bfdfff"
            }
          ]
        },
        {
          "featureType": "landscape.man_made",
          "elementType": "geometry.fill",
          "stylers": [
            {
              "visibility": "off"
            }
          ]
        },
        {
          "featureType": "landscape.man_made",
          "elementType": "geometry.stroke",
          "stylers": [
            {
              "visibility": "simplified"
            }
          ]
        },
        {
          "featureType": "poi",
          "elementType": "all",
          "stylers": [
            {
              "visibility": "on"
            }
          ]
        },
        {
          "featureType": "poi",
          "elementType": "geometry.fill",
          "stylers": [
            {
              "color": "#9acbfd"
            }
          ]
        },
        {
          "featureType": "poi",
          "elementType": "labels.text.fill",
          "stylers": [
            {
              "color": "#1461ad"
            }
          ]
        },
        {
          "featureType": "poi",
          "elementType": "labels.icon",
          "stylers": [
            {
              "hue": "#0080ff"
            }
          ]
        },
        {
          "featureType": "poi.attraction",
          "elementType": "all",
          "stylers": [
            {
              "visibility": "on"
            }
          ]
        },
        {
          "featureType": "poi.attraction",
          "elementType": "geometry.fill",
          "stylers": [
            {
              "color": "#86b7e8"
            }
          ]
        },
        {
          "featureType": "poi.business",
          "elementType": "geometry.fill",
          "stylers": [
            {
              "color": "#9ac6f2"
            }
          ]
        },
        {
          "featureType": "poi.business",
          "elementType": "labels.text",
          "stylers": [
            {
              "visibility": "off"
            }
          ]
        },
        {
          "featureType": "poi.government",
          "elementType": "geometry.fill",
          "stylers": [
            {
              "color": "#86b7e8"
            }
          ]
        },
        {
          "featureType": "poi.government",
          "elementType": "labels.text",
          "stylers": [
            {
              "visibility": "off"
            }
          ]
        },
        {
          "featureType": "poi.medical",
          "elementType": "geometry.fill",
          "stylers": [
            {
              "color": "#89c0f6"
            }
          ]
        },
        {
          "featureType": "poi.medical",
          "elementType": "labels.icon",
          "stylers": [
            {
              "visibility": "on"
            },
            {
              "hue": "#0080ff"
            }
          ]
        },
        {
          "featureType": "poi.park",
          "elementType": "all",
          "stylers": [
            {
              "visibility": "on"
            }
          ]
        },
        {
          "featureType": "poi.park",
          "elementType": "geometry.fill",
          "stylers": [
            {
              "color": "#8ac5ff"
            }
          ]
        },
        {
          "featureType": "poi.park",
          "elementType": "labels.text.fill",
          "stylers": [
            {
              "color": "#1461ad"
            }
          ]
        },
        {
          "featureType": "poi.park",
          "elementType": "labels.icon",
          "stylers": [
            {
              "hue": "#0080ff"
            }
          ]
        },
        {
          "featureType": "poi.place_of_worship",
          "elementType": "geometry.fill",
          "stylers": [
            {
              "color": "#6ba9e7"
            }
          ]
        },
        {
          "featureType": "poi.place_of_worship",
          "elementType": "labels.icon",
          "stylers": [
            {
              "hue": "#0080ff"
            }
          ]
        },
        {
          "featureType": "poi.sports_complex",
          "elementType": "labels.icon",
          "stylers": [
            {
              "hue": "#0080ff"
            }
          ]
        },
        {
          "featureType": "road",
          "elementType": "labels.text.fill",
          "stylers": [
            {
              "color": "#3390ed"
            }
          ]
        },
        {
          "featureType": "road",
          "elementType": "labels.icon",
          "stylers": [
            {
              "hue": "#0080ff"
            }
          ]
        },
        {
          "featureType": "road.highway",
          "elementType": "geometry.fill",
          "stylers": [
            {
              "color": "#ffffff"
            }
          ]
        },
        {
          "featureType": "road.highway",
          "elementType": "geometry.stroke",
          "stylers": [
            {
              "color": "#ffffff"
            }
          ]
        },
        {
          "featureType": "transit",
          "elementType": "all",
          "stylers": [
            {
              "visibility": "on"
            }
          ]
        },
        {
          "featureType": "transit",
          "elementType": "geometry.fill",
          "stylers": [
            {
              "color": "#91c8ff"
            }
          ]
        },
        {
          "featureType": "transit",
          "elementType": "labels.text.fill",
          "stylers": [
            {
              "color": "#247dd6"
            }
          ]
        },
        {
          "featureType": "transit.station.bus",
          "elementType": "all",
          "stylers": [
            {
              "visibility": "off"
            }
          ]
        },
        {
          "featureType": "transit.station.rail",
          "elementType": "all",
          "stylers": [
            {
              "visibility": "on"
            }
          ]
        },
        {
          "featureType": "water",
          "elementType": "all",
          "stylers": [
            {
              "visibility": "on"
            }
          ]
        },
        {
          "featureType": "water",
          "elementType": "geometry.fill",
          "stylers": [
            {
              "color": "#a3d1ff"
            }
          ]
        }
      ]
    };

    const map = new google.maps.Map(document.getElementById('map'), mapOptions);
    const image = 'img/marker.svg';

    const myMarker = new google.maps.Marker({
      position: markerLatLng,
      map: map,
      icon: image,
      animation: google.maps.Animation.DROP
    });
  }

  google.maps.event.addDomListener(window, "load", initMap);
})();
