/*
*
* Moves Live Map Tracking
*
* Requires
* moves api proxy
* mapbox app id and access token
* moment.js
*
*/

var movesmap = movesmap || {};

(function(o){
    var _conf = null;

    /**
     * @param {dict} conf   Required configuration.
     *                      Must contain {'MOVES_API_PROXY': '',
     *                      			  'DAYS': 1,
     *                      			  'MAPBOX_ID': '',
     *                      			  'MAPBOX_ACCESS_TOKEN': '',
     *                      			  'DEFAULT_ZOOM': 10}
     */
    o.init = function(conf){
        this._conf = conf;
        var days = conf.DAYS || 1;
        var api = conf.MOVES_API_PROXY + "/api/1.1/user/storyline/daily?pastDays=${DAYS}";
        var url = api.replace("${DAYS}", days);
        //var url = "/test/storyline.json";
        $.get(url).then(function(data){
            var points = o.load_points(data);
            o.render_map(points.markers, points.waypoints, points.current);
        });
    };

    o.load_points = function(data){
        var markers = [];
        var waypoints = [];

        for(var d = 0; d < data.length; d++){

            var day = data[d];

            for(var s = 0, seg; seg = day.segments[s]; s++){
                if(seg.type === "place"){
                    markers.push({
                        "geo": [seg.place.location.lat, seg.place.location.lon],
                        "startTime": seg.startTime,
                    });
                }

                for(var a = 0, act; act = seg.activities[a]; a++){
                    if(act.trackPoints.length){
                        waypoints.push(act.trackPoints.map(function(track){
                            return [track.lat, track.lon];
                        }));
                    }
                }
            }
        }

        return {
            "markers": markers,
            "waypoints": waypoints,
            "current": waypoints[waypoints.length - 1].pop()
        };
    };

    o.render_map = function(markers, waypoints, current){
        var mymap = L.map('mapid').setView(markers[0].geo, this._conf.DEFAULT_ZOOM);
        L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
            attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
            maxZoom: 18,
            id: this._conf.MAPBOX_ID,
            accessToken: this._conf.MAPBOX_ACCESS_TOKEN
        }).addTo(mymap);

        // Add a line connecting the route taken on each day.
        var polyline = L.polyline(waypoints, {'color': '#B52F27'}).addTo(mymap);
        mymap.fitBounds(polyline.getBounds());

        // Each day sets a new marker to the map.
        for(var j = 0; j < markers.length; j++){
            var marker = L.marker(markers[j].geo);
            var startTime = moment(markers[j].startTime);
            var popuptpl = "<div style='text-align:center;'><h3>" + startTime.format("Do MMMM YYYY") + "</h3>";
            popuptpl += "<p>I made it here by <strong>" + startTime.format("hh:mm:ss a") + "</strong></p></div>";
            marker.bindPopup(popuptpl);
            marker.addTo(mymap);
        }

        // Add current location as special marker
        var mcurrent = L.marker(current, {
            'icon': L.icon({
                'iconUrl': this._conf.WHEREAMI_ICON,
                'iconSize': [64, 64]
            }),
            'title': 'Here I am!',
            'riseOnHover': true
        });
        mcurrent.addTo(mymap);
    };

})(movesmap);
