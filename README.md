#ISS Position

This show this ISS position (and the moon if you can spot it) in real time. Positions are retrieved from [NASA SSC](http://sscweb.gsfc.nasa.gov/WebServices/REST/). Sun position is estimated from current time. You can check that the positions are correct [here](http://www.esa.int/Our_Activities/Human_Spaceflight/International_Space_Station/Where_is_the_International_Space_Station) or by looking the real time ISS streaming [here](http://www.ustream.tv/channel/iss-hdev-payload)

The scene is made using [Three.js](http://threejs.org/). Earth shader is made by [Sean O'Neil](http://http.developer.nvidia.com/GPUGems2/gpugems2_chapter16.html), ported for use with three.js/WebGL by James Baicoianu.

##Install
    bower install
    npm install
    grunt compile