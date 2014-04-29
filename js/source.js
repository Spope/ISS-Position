if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

var container, stats;

var start_time;

var camera, scene, renderer;

var uniforms, mesh, meshes = [];

var mouseX = 0, mouseY = 0,
lat = 0, lon = 0, phy = 0, theta = 0;

var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

init();
animate();

function init() {

    container = document.getElementById( 'container' );

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera( 40, windowHalfX / windowHalfY, 1, 3000 );
    camera.position.z = 4;
    scene.add( camera );

    directionalLight = new THREE.DirectionalLight( 0xaaff33, 0 );
    directionalLight.position.set( -1, 1, 0.5 ).normalize();
    scene.add( directionalLight );

    start_time = Date.now();

    uniforms = {
        sunDirection: { type: "v3", value: new THREE.Vector3(0,1,0) },
        dayTexture: { type: "t", value: 0, texture: THREE.ImageUtils.loadTexture( "textures/earth-day.jpg" ) },
        nightTexture: { type: "t", value: 1, texture: THREE.ImageUtils.loadTexture( "textures/earth-night.jpg" ) }
    };

    uniforms.dayTexture.texture.wrapS = uniforms.dayTexture.texture.wrapT = THREE.Repeat;
    uniforms.nightTexture.texture.wrapS = uniforms.nightTexture.texture.wrapT = THREE.Repeat;

    var size = 0.75;

    material = new THREE.ShaderMaterial( {

        uniforms: uniforms,
        vertexShader: document.getElementById( 'vertexShader' ).textContent,
        fragmentShader: document.getElementById( 'fragmentShader' ).textContent

        } );

    mesh = new THREE.Mesh( new THREE.SphereGeometry( size, 32, 16 ), material );
    scene.add( mesh );

    meshes.push( mesh );



    renderer = new THREE.WebGLRenderer();
    container.appendChild( renderer.domElement );

    stats = new Stats();
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.top = '0px';
    container.appendChild( stats.domElement );

    onWindowResize();

    window.addEventListener( 'resize', onWindowResize, false );

}

function onWindowResize( event ) {

    renderer.setSize( window.innerWidth, window.innerHeight );

}

//

function animate() {

    requestAnimationFrame( animate );

    render();
    stats.update();

}

function render() {

    var t = Date.now() * 0.001;
    uniforms.sunDirection.value.x = Math.sin(t);
    uniforms.sunDirection.value.y = Math.cos(t);

    // Note: Since the earth is at 0,0,0 you can set the normal for the sun
    // with
    //
    // uniforms.sunDirection.value.copy(sunPosition);
    // uniforms.sunDirection.value.normalize();


    for( var i = 0; i < meshes.length; ++ i ) {

        meshes[ i ].rotation.y += 0.01 * ( i % 2 ? 1 : -1 );
        meshes[ i ].rotation.x += 0.01 * ( i % 2 ? -1 : 1 );

    }

    renderer.render( scene, camera );

}
