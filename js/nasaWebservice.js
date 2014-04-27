webservice = {
    _this: this,
    earthRadiusKm: 6378,
    //sscUrl: 'temp.xml',
    sscUrl: 'http://sscweb.gsfc.nasa.gov/WS/sscr/2/locations',

    request: function(satId, start, end) {

        var request = nasaRequest(satId, start, end);

        $.ajax({
            type: 'POST',
            url: this.sscUrl + '', 
            data: request,
            dataType: 'xml',
            contentType: 'application/xml',
            processData: false,
            success: this.displayData, 
            error: this.dataError
        });
    },

    displayData: function(result) {

        var statusCode = $(result).find('StatusCode').text();

        if (statusCode != 'Success') {

            alert('Request for information from SSC failed.');
            return;
        }
        result = $.xml2json(result);
        webservice.displaySatelliteTrajectory(result);
    },

    displaySatelliteTrajectory: function(result) {
        var data = {};
        var times = result.Result.Data.Time;
        var x     = result.Result.Data.Coordinates.X;
        var y     = result.Result.Data.Coordinates.Y;
        var z     = result.Result.Data.Coordinates.Z;
        for (var i in times) {
            //Conversion to GEO coordinate
            data[i] = {
                time: times[i],
                x: y[i] / this.earthRadiusKm,
                y: z[i] / this.earthRadiusKm,
                z: x[i] / this.earthRadiusKm
            };
        }

        drawOrbit(data);
    },

    dataError: function(xmlHttpRequest, textStatus, errorThrown) {
        var errDoc = $.parseXML(xmlHttpRequest.responseText); 
        /* errDoc contains xhtml that we might want to display.
        Alternately, just display the Message and Description values. */

        var msg = $(errDoc).find('.ErrorMessage').text();
        var description = $(errDoc).find('.ErrorDescription').text();

        alert("Server request error:\n  HTTP error: " + errorThrown + 
            "\n  " + msg + "\n  " + description);
    }
};

var start = new Date();
var end = new Date();
end = new Date(end.getTime() + 184*60000);

webservice.request('iss', start, end);
