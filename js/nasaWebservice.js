var dataReqXml1 = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><DataRequest xmlns="http://sscweb.gsfc.nasa.gov/schema">';
var dataReqXml2 = '<BFieldModel><InternalBFieldModel>IGRF-10</InternalBFieldModel><ExternalBFieldModel xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:type="Tsyganenko89cBFieldModel"><KeyParameterValues>KP3_3_3</KeyParameterValues></ExternalBFieldModel><TraceStopAltitude>100</TraceStopAltitude></BFieldModel>';
var dataReqXml3 = '<OutputOptions><AllLocationFilters>true</AllLocationFilters><CoordinateOptions><CoordinateSystem>Gse</CoordinateSystem><Component>X</Component></CoordinateOptions><CoordinateOptions><CoordinateSystem>Gse</CoordinateSystem><Component>Y</Component></CoordinateOptions><CoordinateOptions><CoordinateSystem>Gse</CoordinateSystem><Component>Z</Component></CoordinateOptions><MinMaxPoints>2</MinMaxPoints></OutputOptions></DataRequest>';
var sscUrl='http://sscweb.gsfc.nasa.gov/WS/sscr/2';
var earthRadiusKm = 6378;

webservice = {
    request: function(satId) {
        var startDate = "2012-01-01T20:00:00.000Z";
        var endDate   = "2012-01-02T00:00:00.000Z";
        satId = "iss";

        var timeReqXml = '<TimeInterval><Start>' + startDate +
            '</Start><End>' + endDate + '</End></TimeInterval>';

        var satReqXml = '';
        satReqXml += '<Satellites><Id>' + satId + '</Id>' +
                     '<ResolutionFactor>1</ResolutionFactor></Satellites>';

        var request = dataReqXml1 + timeReqXml + dataReqXml2 + satReqXml + 
                dataReqXml3;

        $.ajax({
            type: 'POST',
            url: sscUrl + '/locations', 
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
        console.log(result);
        webservice.displaySatelliteTrajectory(result);
    },

    displaySatelliteTrajectory: function(result) {
        var data = {};
        var times = result.Result.Data.Time;
        var x     = result.Result.Data.Coordinates.X;
        var y     = result.Result.Data.Coordinates.Y;
        var z     = result.Result.Data.Coordinates.Z;
        for (var i in times) {
            //Conversion to GSE coordinate
            data[i] = {
                time: times[i],
                x: z[i] / earthRadiusKm,
                y: x[i] / earthRadiusKm,
                z: y[i] / earthRadiusKm
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

webservice.request();
