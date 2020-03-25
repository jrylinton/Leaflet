urlQuake = `https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_${tf}.geojson`

var myMap = L.map("map", {
    center: [40.0, -100.0],
    zoom: 4
  });

L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.streets",
    accessToken: API_KEY
  }).addTo(myMap);


optionMag = ['0-1', '1-2', '2-3', '3-4', '4-5', '5+', 'NA']
optionColor = ['rgb(0, 225, 0)','rgb(0, 175, 0)','rgb(225, 225, 0)','rgb(255, 180, 0)','rgb(255, 80, 0)','rgb(180, 0, 0)','rgb(180, 0, 180)']


function selectMagColor(magnitude) {
    if (magnitude <= 1) {return optionColor[0]}
    else if (magnitude <= 2)  {return optionColor[1]}
    else if (magnitude <= 3)  {return optionColor[2]}
    else if (magnitude <= 4)  {return optionColor[3]}
    else if (magnitude <= 5)  {return optionColor[4]}
    else if (magnitude <= 10) {return optionColor[5]}
    else {return optionColor[6]}
}


function sortFeatures(a, b) {
    magA = a.properties.mag
    magB = b.properties.mag
    comparison = 0
    return ((magA < magB) ? 1 : -1)
}

d3.json(urlQuake, function(dataQuake) {
    console.log(dataQuake)

    featuresQuake = dataQuake.features

    featuresQuake.sort(sortFeatures)

    featuresQuake.forEach(features => {
        
        latitude = features.geometry.coordinates[1]
        longitude = features.geometry.coordinates[0]
        idQuake = features.properties.code
        mag = features.properties.mag
        place = features.properties.place
        time = features.properties.time
        alertStatus = features.properties.alert
        significance = features.properties.sig


        var circle = L.circle([latitude, longitude], {
            color: 'black',
            weight: 0.5,
            fillColor: selectMagColor(mag),
            fillOpacity: 0.5,
            radius: mag**2 * 5000
        }).addTo(myMap)


        circle.bindPopup(
            `<h2><center> ${idQuake} </center></h2>
            <hr>
            <p>
            Place: ${place}
            <br>
            Time (UTC): ${time}
            <br>
            Magnitude: ${mag}
            <br>
            Significance: ${significance}
            <br>
            Alert Status: ${alertStatus}
            </p>`
            )

        circle.on({
            mouseover: function(event) {
                layer = event.target
                layer.setStyle({
                    fillOpacity: 0.9
                })
            },
            mouseout: function(event) {
                layer = event.target;
                layer.setStyle({
                fillOpacity: 0.5
                })
            }
        })
    })

    var legend = L.control({ position: "bottomright" })

    legend.onAdd = function() {
        var div = L.DomUtil.create("div", "info legend")
        var limits = optionMag
        var colors = optionColor
        var labels = []

        var legendInfo =
            `<div class="labels" style="background-color: white"></div>`

        div.innerHTML = legendInfo

        limits.forEach(function(limit, index) {
            labels.push(`<p style="background-color: ${colors[index]}">   ${limit}   </p>`)
        })

        div.innerHTML += "<ul>" + labels.join("") + "</ul>";
        return div
    }

        legend.addTo(myMap)

})
