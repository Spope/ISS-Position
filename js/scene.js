var container;
var camera, controls, scene, renderer;
var cross;
var light;
var earthMesh;
var cloudMesh;
var sat;
var receivedDate;
var positionData;
var uniforms;

var timer;

init();
animate();

function init() {

    scene = new THREE.Scene();

    renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );


    //Light
    light = new THREE.DirectionalLight( 0xffffff, 1 );
    light.position.set( 0, 0, 5 );
    //light.castShadow	= true;
    scene.add(light);

    //Sat
    var sphere = new THREE.SphereGeometry(0.03, 10, 10);
    var satMaterial =  new THREE.MeshBasicMaterial({color: 0x00ff00});
    sat = new THREE.Mesh(sphere, satMaterial);
    scene.add(sat);

    //EARTH
    earthMesh = Earth.createEarth();
    scene.add(earthMesh);

    //Night texture mesh
    //var nightLight = new THREE.MeshPhongMaterial();
    //nightLight.map = THREE.ImageUtils.loadTexture('img/earth/EarthNight_2500x1250.png');
    //nightLight.emissive  = new THREE.Color( 0xffffff );
    //nightLight.transparent = true;
    //var geometryLight   = new THREE.SphereGeometry(1.0001, 32, 32);
    //var lightMesh = new THREE.Mesh(geometryLight, nightLight);
    //earthMesh.add(lightMesh);

    //Cloud
    var cloudMesh = Earth.createCloud();
    earthMesh.add(cloudMesh);

    //Atmosphere
    var atmosphereMesh = Earth.createAtmosphere();
    earthMesh.add(atmosphereMesh);


    //Universe
    var geometry  = new THREE.SphereGeometry(400, 32, 32);
    var material  = new THREE.MeshBasicMaterial();
    material.map   = THREE.ImageUtils.loadTexture('img/galaxy_starfield.png');
    material.side  = THREE.BackSide;
    var mesh  = new THREE.Mesh(geometry, material);
    scene.add(mesh);


    setXYZ();


    //Camera
    //FOV, ratio, near, far
    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.01, 1000 );
    camera.position.set(0, 0, 5);
    // Add OrbitControls so that we can rotate around with the mouse.
    controls = new THREE.OrbitControls(camera, renderer.domElement);

    // Create an event listener that resizes the renderer with the browser window.
    window.addEventListener('resize', onWindowResize);

    
}

//Todo : This will set the earth tilt. Need to add it to the xyz based sat position
function initEarthRoll () {
    earthMesh.rotation.x  = (Math.PI / 180) * 23.5;
    cloudMesh.rotation.x  = (Math.PI / 180) * 23.5;
}

function setXYZ() {
    var xMaterial = new THREE.LineBasicMaterial({ color: 0xB50015 });//red
    var xGeometry = new THREE.Geometry();
    xGeometry.vertices.push( new THREE.Vector3( 0, 0, 0) );
    xGeometry.vertices.push( new THREE.Vector3( 2, 0, 0) );
    var x = new THREE.Line( xGeometry, xMaterial );
    scene.add( x );

    var yMaterial = new THREE.LineBasicMaterial({ color: 0x0C7A00 });//green
    var yGeometry = new THREE.Geometry();
    yGeometry.vertices.push( new THREE.Vector3( 0, 0, 0) );
    yGeometry.vertices.push( new THREE.Vector3( 0, 2, 0) );
    var y = new THREE.Line( yGeometry, yMaterial );
    scene.add( y );

    var zMaterial = new THREE.LineBasicMaterial({ color: 0x05009C });//blue
    var zGeometry = new THREE.Geometry();
    zGeometry.vertices.push( new THREE.Vector3( 0, 0, 0) );
    zGeometry.vertices.push( new THREE.Vector3( 0, 0, 2) );
    var z = new THREE.Line( zGeometry, zMaterial );
    scene.add( z );
}

function onWindowResize() {

    var WIDTH = window.innerWidth;
    var HEIGHT = window.innerHeight;
    renderer.setSize(WIDTH, HEIGHT);
    camera.aspect = WIDTH / HEIGHT;
    camera.updateProjectionMatrix();

}

// Renders the scene and updates the render as needed.
function animate() {
 
    // Read more about requestAnimationFrame at http://www.paulirish.com/2011/requestanimationframe-for-smart-animating/
    requestAnimationFrame(animate);

    //updateEarthMaterial();
    //var t = Date.now() * 0.001;
    //var position = new THREE.Vector3();
    //position.setFromMatrixPosition( camera.matrixWorld );
    //window.uniforms.sunDirection.value.x = - position.x;
    //window.uniforms.sunDirection.value.y = position.y;
    //window.uniforms.sunDirection.value.z = position.z;

    updateSatPosition();
    updateEarthAngle();
 
    // Render the scene.
    renderer.render(scene, camera);
    controls.update();

    //console.log(camera.matrixWorld.getPosition());
}

function drawOrbit(data) {

    positionData = data;
    receivedDate = new Date();
    var lineMaterial = new THREE.LineBasicMaterial({ color: 0xB50015 });
    var lineGeometry = new THREE.Geometry();
    for (var i in data) {
        lineGeometry.vertices.push( new THREE.Vector3( data[i].x, data[i].y, data[i].z) );
    }
    var line = new THREE.Line( lineGeometry, lineMaterial ); scene.add( line );

    sat.position.set( data[0].x, data[0].y, data[0].z );
    
}

function updateSatPosition() {
    if(positionData) {
        var first = new Date(positionData[0].time);
        var now = new Date();
        var seconds = now.getSeconds();

        var deltaMinutes = now.getMinutes() - receivedDate.getMinutes();

        var current = positionData[deltaMinutes];
        var next    = positionData[deltaMinutes + 1];
        if(!current) {
            //when delta is negative
            console.error('No data for current');
            console.log(deltaMinutes);
            console.log(current);
        }
        if(!next) {
            console.error('No data for next');
            console.log(deltaMinutes + 1);
            console.log(next);
        }

        var deltaX  = (next.x - current.x) / 60;
        var deltaY  = (next.y - current.y) / 60;
        var deltaZ  = (next.z - current.z) / 60;

        sat.position.set(
            current.x + (deltaX * seconds),
            current.y + (deltaY * seconds),
            current.z + (deltaZ * seconds)
        );

    }
}

function updateEarthAngle() {

    var hourAngle = Math.PI / 12;
    var secondAngle = (hourAngle / 60) / 60;

    var now = new Date();
    var nowGMT = new Date(now.valueOf() + now.getTimezoneOffset() * 60000);
    var currentMinutes = nowGMT.getMinutes();
    var currentHours = nowGMT.getHours();
    var currentSconds = nowGMT.getSeconds();

    var totalSeconds = now.getSeconds() + (currentMinutes * 60) + ((currentHours * 60) * 60);
    earthMesh.rotation.y = Math.PI / 2 + (secondAngle * totalSeconds);

}