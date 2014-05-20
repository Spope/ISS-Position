var nasaRequest = function(satId, startTime, endTime) {

    var coordinateSystem = "Geo";//Gse

    var startDate = start.toISOString();
    var endDate   = end.toISOString();

    var dataReqXml1 = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><DataRequest xmlns="http://sscweb.gsfc.nasa.gov/schema">';
    var dataReqXml2 = '<BFieldModel><InternalBFieldModel>IGRF-10</InternalBFieldModel><ExternalBFieldModel xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:type="Tsyganenko89cBFieldModel"><KeyParameterValues>KP3_3_3</KeyParameterValues></ExternalBFieldModel><TraceStopAltitude>100</TraceStopAltitude></BFieldModel>';
    var dataReqXml3 = '<OutputOptions><AllLocationFilters>true</AllLocationFilters><CoordinateOptions><CoordinateSystem>'+coordinateSystem+'</CoordinateSystem><Component>X</Component></CoordinateOptions><CoordinateOptions><CoordinateSystem>'+coordinateSystem+'</CoordinateSystem><Component>Y</Component></CoordinateOptions><CoordinateOptions><CoordinateSystem>'+coordinateSystem+'</CoordinateSystem><Component>Z</Component></CoordinateOptions><MinMaxPoints>2</MinMaxPoints></OutputOptions></DataRequest>';

    var timeReqXml = '<TimeInterval><Start>' + startDate +
        '</Start><End>' + endDate + '</End></TimeInterval>';

    var satReqXml = '<Satellites><Id>' + satId + '</Id>' +
                 '<ResolutionFactor>1</ResolutionFactor></Satellites>';

    return dataReqXml1 + timeReqXml + dataReqXml2 + satReqXml + 
            dataReqXml3;
};
