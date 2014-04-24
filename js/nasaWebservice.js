var dataReqXml1 = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><DataRequest xmlns="http://sscweb.gsfc.nasa.gov/schema">';
var dataReqXml2 = '<BFieldModel><InternalBFieldModel>IGRF-10</InternalBFieldModel><ExternalBFieldModel xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:type="Tsyganenko89cBFieldModel"><KeyParameterValues>KP3_3_3</KeyParameterValues></ExternalBFieldModel><TraceStopAltitude>100</TraceStopAltitude></BFieldModel>';
var dataReqXml3 = '<OutputOptions><AllLocationFilters>true</AllLocationFilters><CoordinateOptions><CoordinateSystem>Gse</CoordinateSystem><Component>X</Component></CoordinateOptions><CoordinateOptions><CoordinateSystem>Gse</CoordinateSystem><Component>Y</Component></CoordinateOptions><CoordinateOptions><CoordinateSystem>Gse</CoordinateSystem><Component>Z</Component></CoordinateOptions><MinMaxPoints>2</MinMaxPoints></OutputOptions></DataRequest>';
var sscUrl='http://sscweb.gsfc.nasa.gov/WS/sscr/2';

webservice = {
    request: function(satId) {
        var startDate = "2012-01-01T20:00:00.000Z";
        var endDate   = "2012-01-02T00:00:00.000Z";
        var satId = "aim";

        var timeReqXml = '<TimeInterval><Start>' + startDate +
            '</Start><End>' + endDate + '</End></TimeInterval>';

        var satReqXml = '';
        satReqXml += '<Satellites><Id>' + satId + '</Id>' +
                     '<ResolutionFactor>2</ResolutionFactor></Satellites>';

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
        console.log(result);
        //console.log($(result).find('Data').children());

        $('Data', result).each(this.displaySatelliteTrajectory);
    },

    displaySatelliteTrajectory: function(data) {
        console.log("displaySatelliteTrajectory" + data);
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
}

webservice.request();
