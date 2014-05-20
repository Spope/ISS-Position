var camera
var render;
var renderer;
var scene;
var uniforms;
var controls;
var earthPositionData;
var earthReceivedDate;
var moonPositionData;
var moonReceivedDate;
var lensFlare;
var eurlerLight;//Position of shader light
var ground;
var sky;
var cloud;
var sat;
var sun;

//Retrieving shaders
var vertexSky = document.getElementById('vertexSky').textContent;
var fragmentSky = document.getElementById('fragmentSky').textContent;
var vertexGround = document.getElementById('vertexGround').textContent;
var fragmentGround = document.getElementById('fragmentGround').textContent;
var vertexCloud = document.getElementById('vertexCloud').textContent;
var fragmentCloud = document.getElementById('fragmentCloud').textContent;

function initScene() {

    if (!Detector.webgl){
        Detector.addGetWebGLMessage({parent: document.getElementById("canvas")});
    }

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(70, (window.innerWidth-15) / (window.innerHeight*0.8), 0.1, 1000000);
    camera.position.set(0, 0, 300);
    renderer = new THREE.WebGLRenderer({alpha: true});
    renderer.setSize(window.innerWidth - 15, window.innerHeight * 0.8);
    renderer.setClearColorHex(0x000000, 1);
    document.getElementById('canvas').appendChild(renderer.domElement);

    sun = new THREE.DirectionalLight( 0xffffff, 3 );
    sun.position.set( 0, 0, 60000 );
    scene.add( sun );

    //Camera movments
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.minDistance = 180;
    controls.maxDistance = 20000;
    controls.noPan       = true;

    window.addEventListener('resize', onWindowResize);
    createSatellite();
    createEarth();
    createMoon();
    createLensFlare();
    createUniverse();

    render();
}

function onWindowResize() {

    var WIDTH = window.innerWidth - 15;
    var HEIGHT = window.innerHeight * 0.8;
    renderer.setSize(WIDTH, HEIGHT);
    camera.aspect = WIDTH / HEIGHT;
    camera.updateProjectionMatrix();
    //controls.handleResize();
}

function createEarth() {
    var radius = 100.0;
    var atmosphere = {
        Kr: 0.0025,
        Km: 0.0010,
        ESun: 20.0,
        g: -0.950,
        innerRadius: radius,
        cloudRadius: radius * 1.003,
        outerRadius: radius * 1.025,
        wavelength: [0.650, 0.570, 0.475],
        scaleDepth: 0.25,
        mieScaleDepth: 0.1
    };

    var diffuse = THREE.ImageUtils.loadTexture('img/earth/EarthMapAtmos_2500x1250.jpg');
    var diffuseNight = THREE.ImageUtils.loadTexture('img/earth/earthNight.jpg');
    var specular = THREE.ImageUtils.loadTexture('img/earth/EarthMask_2500x1250.jpg');
    var diffuseCloud = THREE.ImageUtils.loadTexture('img/earth/cloudAlpha.png');

    var maxAnisotropy = renderer.getMaxAnisotropy();

    diffuse.anisotropy = maxAnisotropy;
    diffuseNight.anisotropy = maxAnisotropy;
    specular.anisotropy = maxAnisotropy;
    //diffuseCloud.premultiplyAlpha = true;
    diffuseCloud.anisotropy = maxAnisotropy;

    uniforms = {
        v3LightPosition: {
            type: "v3",
            value: new THREE.Vector3(1e8, 0, 0).normalize()
        },
        v3InvWavelength: {
            type: "v3",
            value: new THREE.Vector3(1 / Math.pow(atmosphere.wavelength[0], 4), 1 / Math.pow(atmosphere.wavelength[1], 4), 1 / Math.pow(atmosphere.wavelength[2], 4))
        },
        fCameraHeight: {
            type: "f",
            value: 0
        },
        fCameraHeight2: {
            type: "f",
            value: 0
        },
        fInnerRadius: {
            type: "f",
            value: atmosphere.innerRadius
        },
        fInnerRadius2: {
            type: "f",
            value: atmosphere.innerRadius * atmosphere.innerRadius
        },
        fCloudRadius: {
            type: "f",
            value: atmosphere.cloudRadius
        },
        fCloudRadius2: {
            type: "f",
            value: atmosphere.cloudRadius * atmosphere.cloudRadius
        },
        fOuterRadius: {
            type: "f",
            value: atmosphere.outerRadius
        },
        fOuterRadius2: {
            type: "f",
            value: atmosphere.outerRadius * atmosphere.outerRadius
        },
        fKrESun: {
            type: "f",
            value: atmosphere.Kr * atmosphere.ESun
        },
        fKmESun: {
            type: "f",
            value: atmosphere.Km * atmosphere.ESun
        },
        fKr4PI: {
            type: "f",
            value: atmosphere.Kr * 4.0 * Math.PI
        },
        fKm4PI: {
            type: "f",
            value: atmosphere.Km * 4.0 * Math.PI
        },
        fScale: {
            type: "f",
            value: 1 / (atmosphere.outerRadius - atmosphere.innerRadius)
        },
        fScaleDepth: {
            type: "f",
            value: atmosphere.scaleDepth
        },
        fScaleOverScaleDepth: {
            type: "f",
            value: 1 / (atmosphere.outerRadius - atmosphere.innerRadius) / atmosphere.scaleDepth
        },
        g: {
            type: "f",
            value: atmosphere.g
        },
        g2: {
            type: "f",
            value: atmosphere.g * atmosphere.g
        },
        nSamples: {
            type: "i",
            value: 3
        },
        fSamples: {
            type: "f",
            value: 3.0
        },
        tDiffuse: {
            type: "t",
            value: diffuse
        },
        tDiffuseCloud: {
            type: "t",
            value: diffuseCloud
        },
        tDiffuseNight: {
            type: "t",
            value: diffuseNight
        },
        tDisplacement: {
            type: "t",
            value: 0
        },
        tSkyboxDiffuse: {
            type: "t",
            value: 0
        },
        fNightScale: {
            type: "f",
            value: 1
        },
        tSpecular: {
            type: "t",
            value: specular
        }
    };

    ground = {
        geometry: new THREE.SphereGeometry(atmosphere.innerRadius, 50, 50),
        material: new THREE.ShaderMaterial({
            uniforms: uniforms,
            vertexShader: vertexGround,
            fragmentShader: fragmentGround
        })
    };
    ground.mesh = new THREE.Mesh(ground.geometry, ground.material);
    ground.mesh.castShadow = true;
    ground.mesh.receiveShadow = true;
    scene.add(ground.mesh);

    var atmosphereResolution = 100;
    sky = {
        geometry: new THREE.SphereGeometry(atmosphere.outerRadius, atmosphereResolution, atmosphereResolution),
        material: new THREE.ShaderMaterial({
            uniforms: uniforms,
            vertexShader: vertexSky,
            fragmentShader: fragmentSky
        })
    };
    sky.mesh = new THREE.Mesh(sky.geometry, sky.material);
    ground.mesh.castShadow = true;
    ground.mesh.receiveShadow = true;
    sky.material.side = THREE.BackSide;
    sky.material.transparent = true;
    scene.add(sky.mesh);

    cloud = {
        geometry: new THREE.SphereGeometry(atmosphere.cloudRadius, 50, 50),
        material: new THREE.ShaderMaterial({
            uniforms: uniforms,
            vertexShader: vertexCloud,
            fragmentShader: fragmentCloud
        })
    };
    cloud.mesh = new THREE.Mesh(cloud.geometry, cloud.material);
    cloud.material.transparent = true;
    cloud.material.blending  = THREE.AdditiveBlending;
    scene.add(cloud.mesh);
}

function createMoon() {
    moon = {
        geometry: new THREE.SphereGeometry(27.2, 32, 32),
        material: new THREE.MeshLambertMaterial()
    };
    moon.material.map = THREE.ImageUtils.loadTexture('img/moonmap.jpg');
    moon.mesh = new THREE.Mesh(moon.geometry, moon.material);
    scene.add(moon.mesh);

    //3010 = 384 000 km.
    moon.mesh.position.set(0, 0, 0);
}

function createSatellite() {
    sat = {
        geometry: new THREE.SphereGeometry(1, 10, 10),
        material: new THREE.MeshBasicMaterial({color: 0x00ff00})
    };
    sat.mesh = new THREE.Mesh(sat.geometry, sat.material);
    scene.add(sat.mesh);
}

function createUniverse() {
    var diffuseUniverse = THREE.ImageUtils.loadTexture('img/galaxy_starfield.png');
    var universe = {
        geometry: new THREE.SphereGeometry(1000000, 32, 32),
        material: new THREE.MeshBasicMaterial()
    };
    universe.material.map = diffuseUniverse;
    universe.material.side  = THREE.BackSide;
    universe.mesh = new THREE.Mesh(universe.geometry, universe.material);
    scene.add(universe.mesh);
}

function createLensFlare() {

    var textureFlare0 = THREE.ImageUtils.loadTexture("img/lensflare/lensflare0.png");
    var textureFlare2 = THREE.ImageUtils.loadTexture("img/lensflare/lensflare2.png");
    var textureFlare3 = THREE.ImageUtils.loadTexture("img/lensflare/lensflare3.png");

    var flareColor = new THREE.Color(0xffffff);
    flareColor.setHSL(0.55, 0.9, 0.5 + 0.5);
    lensFlare = new THREE.LensFlare(textureFlare0, 700, 0.0, THREE.AdditiveBlending, flareColor);

    lensFlare.add(textureFlare2, 512, 0.0, THREE.AdditiveBlending);
    lensFlare.add(textureFlare2, 512, 0.0, THREE.AdditiveBlending);
    lensFlare.add(textureFlare2, 512, 0.0, THREE.AdditiveBlending);

    lensFlare.add(textureFlare3, 60, 0.6, THREE.AdditiveBlending);
    lensFlare.add(textureFlare3, 70, 0.7, THREE.AdditiveBlending);
    lensFlare.add(textureFlare3, 120, 0.9, THREE.AdditiveBlending);
    lensFlare.add(textureFlare3, 70, 1.0, THREE.AdditiveBlending);

    lensFlare.position.set(0, 0, 500);

    scene.add(lensFlare);
}

function setXYZ() {
    //XYZ lines
    var xMaterial = new THREE.LineBasicMaterial({ color: 0xB50015 });//red
    var xGeometry = new THREE.Geometry();
    xGeometry.vertices.push( new THREE.Vector3( 0, 0, 0) );
    xGeometry.vertices.push( new THREE.Vector3( 150, 0, 0) );
    var x = new THREE.Line( xGeometry, xMaterial );
    scene.add( x );

    var yMaterial = new THREE.LineBasicMaterial({ color: 0x0C7A00 });//green
    var yGeometry = new THREE.Geometry();
    yGeometry.vertices.push( new THREE.Vector3( 0, 0, 0) );
    yGeometry.vertices.push( new THREE.Vector3( 0, 150, 0) );
    var y = new THREE.Line( yGeometry, yMaterial );
    scene.add( y );

    var zMaterial = new THREE.LineBasicMaterial({ color: 0x05009C });//blue
    var zGeometry = new THREE.Geometry();
    zGeometry.vertices.push( new THREE.Vector3( 0, 0, 0) );
    zGeometry.vertices.push( new THREE.Vector3( 0, 0, 150) );
    var z = new THREE.Line( zGeometry, zMaterial );
    scene.add( z );
}

function updateEarthAngle() {

    //Rotating the earth to expose the right side on the sun
    var hourAngle = Math.PI / 12;
    var secondAngle = (hourAngle / 60) / 60;

    var now = new Date();
    var nowGMT = new Date(now.valueOf() + now.getTimezoneOffset() * 60000);
    var currentMinutes = nowGMT.getMinutes();
    var currentHours = nowGMT.getHours();
    var currentSeconds = nowGMT.getSeconds();

    //Shader light position
    var totalSeconds = currentSeconds + (currentMinutes * 60) + ((currentHours * 60) * 60);
    var angle = Math.PI - (secondAngle * totalSeconds);
    eurlerLight = new THREE.Euler(0, angle, 0);

    //Lensflare position
    var angleDegree = angle + (Math.PI / 2);// * (180/Math.PI);
    var z = 500000 * Math.sin(angleDegree); 
    var x = 500000 * Math.cos(angleDegree);

    lensFlare.position.set( z, 0, x );
    sun.position.set(z, 0, x);
}

function render() {
    
    var cameraHeight, eye, light, matrix, vector;
    requestAnimationFrame(render);
    controls.update();

    eurlerLight = new THREE.Euler(0, 0, 0);

    updateEarthAngle();
    updateSatPosition();
    updateMoonPosition();

    vector = new THREE.Vector3(1, 0, 0);
    matrix = new THREE.Matrix4().makeRotationFromEuler(eurlerLight);
    light  = vector.applyProjection(matrix);

    cameraHeight = camera.position.length();
    sky.material.uniforms.v3LightPosition.value = light;
    sky.material.uniforms.fCameraHeight.value = cameraHeight;
    sky.material.uniforms.fCameraHeight2.value = cameraHeight * cameraHeight;

    ground.material.uniforms.v3LightPosition.value = light;
    ground.material.uniforms.fCameraHeight.value = cameraHeight;
    ground.material.uniforms.fCameraHeight2.value = cameraHeight * cameraHeight;

    cloud.material.uniforms.v3LightPosition.value = light;
    cloud.material.uniforms.fCameraHeight.value = cameraHeight;
    cloud.material.uniforms.fCameraHeight2.value = cameraHeight * cameraHeight;

    return renderer.render(scene, camera);
}

function drawOrbit (data) {
    //Trace orbit line from data
    var lineMaterial = new THREE.LineBasicMaterial({ color: 0xB50015 });
    var lineGeometry = new THREE.Geometry();
    for (var i in data) {
        lineGeometry.vertices.push( new THREE.Vector3( data[i].x, data[i].y, data[i].z) );
    }
    var line = new THREE.Line( lineGeometry, lineMaterial ); scene.add( line );
}

function updateSatPosition() {
    if(earthPositionData) {
        var position = interpolatePosition(earthPositionData, earthReceivedDate);

        sat.mesh.position.set(
            position.x,
            position.y,
            position.z
        );
    }
}

function satPosition(data) {
    earthPositionData = data;
    earthReceivedDate = new Date();
    //First position of earth
    sat.mesh.position.set(data[0].x, data[0].y, data[0].z);
    drawOrbit(data);
}

function moonPosition(data) {
    moonPositionData = data;
    moonReceivedDate = new Date();
    //First position of moon
    moon.mesh.position.set(data[0].x, data[0].y, data[0].z);
}

function updateMoonPosition() {
    if(moonPositionData) {
        var position = interpolatePosition(moonPositionData, moonReceivedDate);

        moon.mesh.position.set(
            position.x,
            position.y,
            position.z
        );
    }
}

function interpolatePosition(data, receivedDate){

    var first = new Date(data[0].time);
    var now = new Date();
    var seconds = now.getSeconds();

    var deltaMinutes = now.getMinutes() - receivedDate.getMinutes();

    //Adding 60 minutes for each hours
    var additionalMinutes = (now.getHours() - receivedDate.getHours()) * 60;
    deltaMinutes += additionalMinutes;

    var current = data[deltaMinutes];
    var next    = data[deltaMinutes + 1];
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

    var position = {};
    
    position.x = current.x + (deltaX * seconds);
    position.y = current.y + (deltaY * seconds);
    position.z = current.z + (deltaZ * seconds);

    return position;
}


initScene();
