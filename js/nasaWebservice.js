var GetPosition = function(satId, start, end, callback) {
    var _this = this;
    this.satId = satId;
    this.earthRadiusKm = 6378 / 100;
    //this.sscUrl = 'moon.xml',
    this.sscUrl = 'http://sscweb.gsfc.nasa.gov/WS/sscr/2/locations';
    this.callback = callback;
};

GetPosition.prototype.request = function() {

    var request = nasaRequest(this.satId, this.start, this.end);

    $.ajax({
        type: 'POST',
        url: this.sscUrl + '', 
        data: request,
        dataType: 'xml',
        contentType: 'application/xml',
        processData: false,
        success: this.displayData.bind(this), 
        error: this.dataError
    });
};

GetPosition.prototype.displayData = function(result) {

    var statusCode = $(result).find('StatusCode').text();

    if (statusCode != 'Success') {

        alert('Request for information from SSC failed.');
        return;
    }
    result = $.xml2json(result);
    this.displaySatelliteTrajectory(result);
};

GetPosition.prototype.displaySatelliteTrajectory = function(result) {
    var data  = {};
    var times = result.Result.Data.Time;
    var x     = result.Result.Data.Coordinates.X;
    var y     = result.Result.Data.Coordinates.Y;
    var z     = result.Result.Data.Coordinates.Z;
    for (var i in times) {
        //Conversion to GEO coordinate
        data[i] = {
            time: times[i],
            x: (x[i] / this.earthRadiusKm),
            y: (z[i] / this.earthRadiusKm),
            z: -(y[i] / this.earthRadiusKm)
        };
    }

    this.callback(data);
};

GetPosition.prototype.dataError = function(xmlHttpRequest, textStatus, errorThrown) {
    var errDoc = $.parseXML(xmlHttpRequest.responseText); 
    /* errDoc contains xhtml that we might want to display.
    Alternately, just display the Message and Description values. */

    var msg = $(errDoc).find('.ErrorMessage').text();
    var description = $(errDoc).find('.ErrorDescription').text();

    alert("Server request error:\n  HTTP error: " + errorThrown + 
        "\n  " + msg + "\n  " + description);
};

var start = new Date();
var end = new Date();
end = new Date(end.getTime() + (184 * 60000));
$(function() {
    var iss = new GetPosition('iss', start, end, satPosition);
    iss.request();
    var moon = new GetPosition('moon', start, end, moonPosition);
    moon.request();
});
