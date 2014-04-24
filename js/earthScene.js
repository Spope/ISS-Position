var container;
var camera, controls, scene, renderer;
var cross;
var light;
var earthMesh;

init();
animate();

function init() {

    scene = new THREE.Scene();

    renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );


    //Light
    light = new THREE.DirectionalLight( 0xffffff, 1 );
    light.position.set( 5, 5, 10 );
    light.castShadow	= true;
    scene.add(light);


    //EARTH
    var geometry   = new THREE.SphereGeometry(1, 32, 32);
    var material  = new THREE.MeshPhongMaterial();
    material.map    = THREE.ImageUtils.loadTexture('img/earth/EarthMapAtmos_2500x1250.jpg');
    material.bumpMap    = THREE.ImageUtils.loadTexture('img/earth/EarthElevation_2500x1250.jpg');
    material.bumpScale = 0.02;
    material.specularMap    = THREE.ImageUtils.loadTexture('img/earth/EarthMask_2500x1250.jpg');
    material.specular  = new THREE.Color('grey');

    earthMesh = new THREE.Mesh(geometry, material);
    scene.add(earthMesh);

    //Cloud
    var geometry   = new THREE.SphereGeometry(1.01, 32, 32);
    var material  = new THREE.MeshPhongMaterial({
      map         : THREE.ImageUtils.loadTexture('img/earth/cloudAlpha.png'),
      opacity     : 1,
      transparent : true,
    });
    var cloudMesh = new THREE.Mesh(geometry, material);
    earthMesh.add(cloudMesh);


    //Universe
    var geometry  = new THREE.SphereGeometry(400, 32, 32);
    var material  = new THREE.MeshBasicMaterial();
    material.map   = THREE.ImageUtils.loadTexture('img/galaxy_starfield.png');
    material.side  = THREE.BackSide;
    // create the mesh based on geometry and material
    var mesh  = new THREE.Mesh(geometry, material);
    scene.add(mesh);





    //Camera
    //FOV, ratio, near, far
    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.01, 1000 );
    camera.position.set(0, 0, 5);
    // Add OrbitControls so that we can rotate around with the mouse.
    controls = new THREE.OrbitControls(camera, renderer.domElement);

    // Create an event listener that resizes the renderer with the browser window.
    window.addEventListener('resize', onWindowResize);
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
 
    // Render the scene.
    renderer.render(scene, camera);
    controls.update();
}
