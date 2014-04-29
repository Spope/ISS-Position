var Earth = {
    createEarth: function() {
        
        //Base material
        var material  = new THREE.MeshPhongMaterial();
        material.map    = THREE.ImageUtils.loadTexture('img/earth/EarthMapAtmos_2500x1250.jpg');
        material.bumpMap    = THREE.ImageUtils.loadTexture('img/earth/EarthElevation_2500x1250.jpg');
        material.bumpScale = 0.002;
        material.specularMap    = THREE.ImageUtils.loadTexture('img/earth/EarthMask_2500x1250.jpg');
        material.specular  = new THREE.Color('grey');
        material.shininess  = 10;
        //var material = this.createMaterial();

        //Mesh
        var geometry   = new THREE.SphereGeometry(1, 32, 32);
        earthMesh = new THREE.Mesh(geometry, material);

        //earthMesh.receiveShadow	= true;
        //earthMesh.castShadow	= true;

        return earthMesh;
    },

    createMaterial: function() {
        uniforms = {
            sunDirection: {
                type: "v3",
                value: new THREE.Vector3(1, 0, 0)
            },
            dayTexture: {
                type: "t",
                value: THREE.ImageUtils.loadTexture("img/earth/EarthMapAtmos_2500x1250.jpg")
            },
            nightTexture: {
                type: "t",
                value: THREE.ImageUtils.loadTexture("img/earth/EarthNight_2500x1250.jpg")
            }
        };

        uniforms.dayTexture.value.wrapS = THREE.RepeatWrapping;
        uniforms.dayTexture.value.wrapT = THREE.RepeatWrapping;
        uniforms.nightTexture.value.wrapS = THREE.RepeatWrapping;
        uniforms.nightTexture.value.wrapT = THREE.RepeatWrapping;

        var earthMaterial = new THREE.ShaderMaterial({

            uniforms: uniforms,
            vertexShader: document.getElementById('vertexShader').textContent,
            fragmentShader: document.getElementById('fragmentShader').textContent
        });

        return earthMaterial;


    },
    createCloud: function() {

        var geometry   = new THREE.SphereGeometry(1.005, 32, 32);
        var material  = new THREE.MeshPhongMaterial({
          map         : THREE.ImageUtils.loadTexture('img/earth/cloudAlpha.png'),
          transparent : true,
        });
        cloudMesh = new THREE.Mesh(geometry, material);

        return cloudMesh;
    },

    createAtmosphere: function() {

        var geometry	= new THREE.SphereGeometry(1, 32, 32);
        var material	= THREEx.createAtmosphereMaterial();
        material.side	= THREE.BackSide;
        material.uniforms.glowColor.value.set(0x0041CC);
        material.uniforms.coeficient.value	= 0.5;
        material.uniforms.power.value		= 2.5;
        var mesh	= new THREE.Mesh(geometry, material );
        mesh.scale.multiplyScalar(1.05);

        return mesh;
    }

};
