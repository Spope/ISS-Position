var c, camera, diffuse, diffuseNight, specular, f, g, ground, maxAnisotropy, render, renderer, scene, sky, uniforms, controls;

scene = new THREE.Scene();

camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 500);

renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColorHex(0x000000, 1);
document.body.appendChild(renderer.domElement);

controls = new THREE.OrbitControls(camera, renderer.domElement);

/*$(window).resize(function() {
  camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
  return renderer.setSize(window.innerWidth, window.innerHeight);
});
*/

var vertexSky = document.getElementById('vertexSky').textContent;
var fragmentSky = document.getElementById('fragmentSky').textContent;
var vertexGround = document.getElementById('vertexGround').textContent;
var fragmentGround = document.getElementById('fragmentGround').textContent;

var radius = 100.0;


//atmosphere = {
	//Kr            : 0.0025,
	//Km            : 0.0010,
	//ESun          : 15.0,
	//g             : -0.990,
	//innerRadius   : radius,
	//outerRadius   : radius * 1.05,
	//wavelength    : [0.650, 0.570, 0.475],
	//scaleDepth    : 0.25,
	//mieScaleDepth : 0.1
//}

var atmosphere = {
  Kr: 0.0025,
  Km: 0.0010,
  ESun: 20.0,
  g: -0.950,
  innerRadius: 100,
  outerRadius: 102.5,
  wavelength: [0.650, 0.570, 0.475],
  scaleDepth: 0.25,
  mieScaleDepth: 0.1
};

diffuse = THREE.ImageUtils.loadTexture('img/earth/EarthMapAtmos_2500x1250.jpg');
diffuseNight = THREE.ImageUtils.loadTexture('img/earth/earthNight.jpg');
specular = THREE.ImageUtils.loadTexture('img/earth/EarthMask_2500x1250.jpg');

maxAnisotropy = renderer.getMaxAnisotropy();

diffuse.anisotropy = maxAnisotropy;
diffuseNight.anisotropy = maxAnisotropy;
specular.anisotropy = maxAnisotropy;

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
 
scene.add(ground.mesh);

sky = {
  geometry: new THREE.SphereGeometry(atmosphere.outerRadius, 100, 100),
  material: new THREE.ShaderMaterial({
    uniforms: uniforms,
    vertexShader: vertexSky,
    fragmentShader: fragmentSky
  })
};

sky.mesh = new THREE.Mesh(sky.geometry, sky.material);

sky.material.side = THREE.BackSide;

sky.material.transparent = true;

scene.add(sky.mesh);

c = null;
f = 0;
g = 0;

function updateEarthAngle() {

    var hourAngle = Math.PI / 12;
    //var secondAngle = (hourAngle / 60) / 60;
    var secondAngle = (hourAngle / 10);

    var now = new Date();
    var nowGMT = new Date(now.valueOf() + now.getTimezoneOffset() * 60000);
    var currentMinutes = nowGMT.getMinutes();
    var currentHours = nowGMT.getHours();
    var currentSconds = nowGMT.getSeconds();

    var totalSeconds = now.getSeconds() + (currentMinutes * 60) + ((currentHours * 60) * 60);
    ground.mesh.rotation.y = Math.PI / 2 + (secondAngle * totalSeconds);

}

render = function() {
  controls.update();
  var cameraHeight, euler, eye, light, matrix, vector;
  requestAnimationFrame(render);
  //f += 0.0002;
  //g += 0.008;
  //vector = new THREE.Vector3(radius * 1.9, 0, 0);
  //euler = new THREE.Euler(g / 60 + 12, -f * 10 + 20, 0);
  //matrix = new THREE.Matrix4().makeRotationFromEuler(euler);
  //eye = vector.applyProjection(matrix);
  //camera.position = eye;
  //camera.lookAt(new THREE.Vector3(0, 0, 0));


  vector = new THREE.Vector3(1, 0, 0);
  euler = new THREE.Euler(1, 0, 0);
  matrix = new THREE.Matrix4().makeRotationFromEuler(euler);
  light = vector.applyProjection(matrix);
//updateEarthAngle();
  cameraHeight = camera.position.length();
  sky.material.uniforms.v3LightPosition.value = light;
  sky.material.uniforms.fCameraHeight.value = cameraHeight;
  sky.material.uniforms.fCameraHeight2.value = cameraHeight * cameraHeight;

  ground.material.uniforms.v3LightPosition.value = light;
  ground.material.uniforms.fCameraHeight.value = cameraHeight;
  ground.material.uniforms.fCameraHeight2.value = cameraHeight * cameraHeight;


  return renderer.render(scene, camera);


    
};

render();
