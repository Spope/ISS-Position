<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <link rel="stylesheet" href="css/style.css" type="text/css" media="screen" />
    <link rel="stylesheet" href="js/bower_components/bootstrap/dist/css/bootstrap.min.css" type="text/css" media="all" />
    <meta property="og:image" content="img/screenshot.png"/>
    <meta name="description" content="ISS Position shows you the ISS Position in realtime on a realistic 3D earth." />
    <meta name="keywords" content="WebGL, three.js, Earth, realistic, 3d, ISS" />
    <meta name="viewport" content="width=device-width, user-scalable=no">
    
    <title>ISS Position</title>

<?php 
$debug = false;
if(!$debug){
?>
    <script src="js/build/lib.min.js"></script>
<?php
}else {
    ?>
    <script src="js/bower_components/jquery/dist/jquery.min.js"></script>
    <script src="js/others/three.min.js"></script>
    <script src="js/others/orbitControll.js"></script>
    <script src="js/others/xmlToJson.js"></script>
    <script src="js/others/detector.js"></script>
<?php
}   
?>

</head>
<body>
<div id="fb-root"></div>
<script>(function(d, s, id) {
  var js, fjs = d.getElementsByTagName(s)[0];
  if (d.getElementById(id)) return;
  js = d.createElement(s); js.id = id;
  js.src = "//connect.facebook.net/fr_FR/all.js#xfbml=1";
  fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));</script>
<div id="header">
    <div id="canvas"></div>
    <div id="bottom">
        <a id="btn-bottom">
            <img src="img/bottom.png" width="40" height="40" />
        </a>
    </div>
</div>

<div class="container">
    <div class="row">
        <h1 class="col-md-12">ISS Position</h1>

        <div class="col-md-12">
            <p>This show this ISS position (and the moon if you can spot it) in real time. Positions are retrieved from <a href="http://sscweb.gsfc.nasa.gov/WebServices/REST/" title="NASA SSC Rest API" target="_blank">NASA SSC</a>. Sun position is estimated from current time. You can check that the positions are correct <a href="http://www.esa.int/Our_Activities/Human_Spaceflight/International_Space_Station/Where_is_the_International_Space_Station" title="Where is the International Space Station ?" target="_blank">here</a> or by looking the real time ISS streaming <a title="ISS HD Earth Viewing Experiment" href="http://www.ustream.tv/channel/iss-hdev-payload" target="_blank">here</a>.</p>
            <p>The scene is made using <a href="http://threejs.org/" title="Three.js" target="_blank">Three.js</a>. Earth shader is made by <a href="http://http.developer.nvidia.com/GPUGems2/gpugems2_chapter16.html" title="Sean O'Neil Atmospheric Scattering" target="_blank">Sean O'Neil</a>, ported for use with three.js/WebGL by James Baicoianu.</p>
            <br />
            <p>Made by <a href="http://spope.fr" title="Spope's portfolio">Spope</a>.</p>
        </div>
    </div>

    <div id="share" class="row">
        <h3 class="col-md-12">Share</h3>
        <div class="col-md-12">
            <div class="pull-left">
                <!-- Place this tag where you want the +1 button to render. -->
                <div class="g-plusone" data-size="medium"></div>

                <!-- Place this tag after the last +1 button tag. -->
                <script type="text/javascript">
                  (function() {
                    var po = document.createElement('script'); po.type = 'text/javascript'; po.async = true;
                    po.src = 'https://apis.google.com/js/platform.js';
                    var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(po, s);
                  })();
                </script>
            </div>

            <div class="pull-left">
                <a href="https://twitter.com/share" class="twitter-share-button" data-via="spopila">Tweet</a>
        <script>!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0],p=/^http:/.test(d.location)?'http':'https';if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src=p+'://platform.twitter.com/widgets.js';fjs.parentNode.insertBefore(js,fjs);}}(document, 'script', 'twitter-wjs');</script>
            </div>

            <div class="fll">
                <div class="fb-share-button" data-href="http://projects.spope.fr/iss-position/" data-type="button_count"></div>
            </div>
        </div>
        <div class="clearfix"></div>
    </div>
</div>
</body>

<script id="vertexSky" type="x-shader/x-fragment">
    //
    // Atmospheric scattering vertex shader
    //
    // Author: Sean O'Neil
    //
    // Copyright (c) 2004 Sean O'Neil
    //

    uniform vec3 v3LightPosition;	// The direction vector to the light source
    uniform vec3 v3InvWavelength;	// 1 / pow(wavelength, 4) for the red, green, and blue channels
    uniform float fCameraHeight;	// The camera's current height
    uniform float fCameraHeight2;	// fCameraHeight^2
    uniform float fOuterRadius;		// The outer (atmosphere) radius
    uniform float fOuterRadius2;	// fOuterRadius^2
    uniform float fInnerRadius;		// The inner (planetary) radius
    uniform float fInnerRadius2;	// fInnerRadius^2
    uniform float fKrESun;			// Kr * ESun
    uniform float fKmESun;			// Km * ESun
    uniform float fKr4PI;			// Kr * 4 * PI
    uniform float fKm4PI;			// Km * 4 * PI
    uniform float fScale;			// 1 / (fOuterRadius - fInnerRadius)
    uniform float fScaleDepth;		// The scale depth (i.e. the altitude at which the atmosphere's average density is found)
    uniform float fScaleOverScaleDepth;	// fScale / fScaleDepth

    const int nSamples = 3;
    const float fSamples = 3.0;

    varying vec3 v3Direction;
    varying vec3 c0;
    varying vec3 c1;


    float scale(float fCos)
    {
        float x = 1.0 - fCos;
        return fScaleDepth * exp(-0.00287 + x*(0.459 + x*(3.83 + x*(-6.80 + x*5.25))));
    }

    void main(void)
    {
        // Get the ray from the camera to the vertex and its length (which is the far point of the ray passing through the atmosphere)
        vec3 v3Ray = position - cameraPosition;
        float fFar = length(v3Ray);
        v3Ray /= fFar;

        // Calculate the closest intersection of the ray with the outer atmosphere (which is the near point of the ray passing through the atmosphere)
        float B = 2.0 * dot(cameraPosition, v3Ray);
        float C = fCameraHeight2 - fOuterRadius2;
        float fDet = max(0.0, B*B - 4.0 * C);
        float fNear = 0.5 * (-B - sqrt(fDet));

        // Calculate the ray's starting position, then calculate its scattering offset
        vec3 v3Start = cameraPosition + v3Ray * fNear;
        fFar -= fNear;
        float fStartAngle = dot(v3Ray, v3Start) / fOuterRadius;
        float fStartDepth = exp(-1.0 / fScaleDepth);
        float fStartOffset = fStartDepth * scale(fStartAngle);
        //c0 = vec3(1.0, 0, 0) * fStartAngle;

        // Initialize the scattering loop variables
        float fSampleLength = fFar / fSamples;
        float fScaledLength = fSampleLength * fScale;
        vec3 v3SampleRay = v3Ray * fSampleLength;
        vec3 v3SamplePoint = v3Start + v3SampleRay * 0.5;

        //gl_FrontColor = vec4(0.0, 0.0, 0.0, 0.0);

        // Now loop through the sample rays
        vec3 v3FrontColor = vec3(0.0, 0.0, 0.0);
        for(int i=0; i<nSamples; i++)
        {
            float fHeight = length(v3SamplePoint);
            float fDepth = exp(fScaleOverScaleDepth * (fInnerRadius - fHeight));
            float fLightAngle = dot(v3LightPosition, v3SamplePoint) / fHeight;
            float fCameraAngle = dot(v3Ray, v3SamplePoint) / fHeight;
            float fScatter = (fStartOffset + fDepth * (scale(fLightAngle) - scale(fCameraAngle)));
            vec3 v3Attenuate = exp(-fScatter * (v3InvWavelength * fKr4PI + fKm4PI));

            v3FrontColor += v3Attenuate * (fDepth * fScaledLength);
            v3SamplePoint += v3SampleRay;
        }

        // Finally, scale the Mie and Rayleigh colors and set up the varying variables for the pixel shader
        gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
        c0 = v3FrontColor * (v3InvWavelength * fKrESun);
        c1 = v3FrontColor * fKmESun;
        v3Direction = cameraPosition - position;
    }
</script>

<script id="fragmentSky" type="x-shader/x-fragment">
    //
    // Atmospheric scattering fragment shader
    //
    // Author: Sean O'Neil
    //
    // Copyright (c) 2004 Sean O'Neil
    //

    uniform vec3 v3LightPos;
    uniform float g;
    uniform float g2;

    varying vec3 v3Direction;
    varying vec3 c0;
    varying vec3 c1;

    // Calculates the Mie phase function
    float getMiePhase(float fCos, float fCos2, float g, float g2)
    {
        return 1.5 * ((1.0 - g2) / (2.0 + g2)) * (1.0 + fCos2) / pow(1.0 + g2 - 2.0 * g * fCos, 1.5);
    }

    // Calculates the Rayleigh phase function
    float getRayleighPhase(float fCos2)
    {
        return 0.75 + 0.75 * fCos2;
    }

    void main (void)
    {
        float fCos = dot(v3LightPos, v3Direction) / length(v3Direction);
        float fCos2 = fCos * fCos;

        vec3 color =	getRayleighPhase(fCos2) * c0 +
                        getMiePhase(fCos, fCos2, g, g2) * c1;

        gl_FragColor = vec4(color, 1.0);
        gl_FragColor.a = gl_FragColor.b;
    }
</script>

<script id="vertexGround" type="x-shader/x-fragment">
    //
    // Atmospheric scattering vertex shader
    //
    // Author: Sean O'Neil
    //
    // Copyright (c) 2004 Sean O'Neil
    //
    // Ported for use with three.js/WebGL by James Baicoianu

    uniform vec3 v3LightPosition;		// The direction vector to the light source
    uniform vec3 v3InvWavelength;	// 1 / pow(wavelength, 4) for the red, green, and blue channels
    uniform float fCameraHeight;	// The camera's current height
    uniform float fCameraHeight2;	// fCameraHeight^2
    uniform float fOuterRadius;		// The outer (atmosphere) radius
    uniform float fOuterRadius2;	// fOuterRadius^2
    uniform float fInnerRadius;		// The inner (planetary) radius
    uniform float fInnerRadius2;	// fInnerRadius^2
    uniform float fKrESun;			// Kr * ESun
    uniform float fKmESun;			// Km * ESun
    uniform float fKr4PI;			// Kr * 4 * PI
    uniform float fKm4PI;			// Km * 4 * PI
    uniform float fScale;			// 1 / (fOuterRadius - fInnerRadius)
    uniform float fScaleDepth;		// The scale depth (i.e. the altitude at which the atmosphere's average density is found)
    uniform float fScaleOverScaleDepth;	// fScale / fScaleDepth
    uniform sampler2D tDiffuse;

    varying vec3 v3Direction;
    varying vec3 c0;
    varying vec3 c1;
    varying vec3 vNormal;
    varying vec2 vUv;
    varying vec2 testCoord;

    const int nSamples = 3;
    const float fSamples = 3.0;

    float scale(float fCos)
    {
        float x = 1.0 - fCos;
        return fScaleDepth * exp(-0.00287 + x*(0.459 + x*(3.83 + x*(-6.80 + x*5.25))));
    }

    void main(void)
    {
        // Get the ray from the camera to the vertex and its length (which is the far point of the ray passing through the atmosphere)
        vec3 v3Ray = position - cameraPosition;
        float fFar = length(v3Ray);
        v3Ray /= fFar;

        // Calculate the closest intersection of the ray with the outer atmosphere (which is the near point of the ray passing through the atmosphere)
        float B = 2.0 * dot(cameraPosition, v3Ray);
        float C = fCameraHeight2 - fOuterRadius2;
        float fDet = max(0.0, B*B - 4.0 * C);
        float fNear = 0.5 * (-B - sqrt(fDet));

        // Calculate the ray's starting position, then calculate its scattering offset
        vec3 v3Start = cameraPosition + v3Ray * fNear;
        fFar -= fNear;
        float fDepth = exp((fInnerRadius - fOuterRadius) / fScaleDepth);
        float fCameraAngle = dot(-v3Ray, position) / length(position);
        float fLightAngle = dot(v3LightPosition, position) / length(position);
        float fCameraScale = scale(fCameraAngle);
        float fLightScale = scale(fLightAngle);
        float fCameraOffset = fDepth*fCameraScale;
        float fTemp = (fLightScale + fCameraScale);

        // Initialize the scattering loop variables
        float fSampleLength = fFar / fSamples;
        float fScaledLength = fSampleLength * fScale;
        vec3 v3SampleRay = v3Ray * fSampleLength;
        vec3 v3SamplePoint = v3Start + v3SampleRay * 0.5;

        // Now loop through the sample rays
        vec3 v3FrontColor = vec3(0.0, 0.0, 0.0);
        vec3 v3Attenuate;
        for(int i=0; i<nSamples; i++)
        {
            float fHeight = length(v3SamplePoint);
            float fDepth = exp(fScaleOverScaleDepth * (fInnerRadius - fHeight));
            float fScatter = fDepth*fTemp - fCameraOffset;
            v3Attenuate = exp(-fScatter * (v3InvWavelength * fKr4PI + fKm4PI));
            v3FrontColor += v3Attenuate * (fDepth * fScaledLength);
            v3SamplePoint += v3SampleRay;
        }

        // Calculate the attenuation factor for the ground
        c0 = v3Attenuate;
        c1 = v3FrontColor * (v3InvWavelength * fKrESun + fKmESun);

      gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
      //testCoord = gl_TextureMatrix[1] * gl_MultiTexCoord1;
        //gl_TexCoord[0] = gl_TextureMatrix[1] * gl_MultiTexCoord1;
        //gl_TexCoord[1] = gl_TextureMatrix[1] * gl_MultiTexCoord1;
      vUv = uv;
      vNormal = normal;
    }
</script>


<script id="fragmentGround" type="x-shader/x-fragment">
    //
    // Atmospheric scattering fragment shader
    //
    // Author: Sean O'Neil
    //
    // Copyright (c) 2004 Sean O'Neil
    //
    // Ported for use with three.js/WebGL by James Baicoianu

    uniform float fNightScale;
    uniform vec3 v3LightPosition;
    uniform sampler2D tDiffuse;
    uniform sampler2D tDiffuseNight;
    uniform sampler2D tSpecular;


    varying vec3 c0;
    varying vec3 c1;
    varying vec3 vNormal;
    varying vec2 vUv;
    varying vec3 v3Direction;

    void main (void)
    {
        //Spope
        /*
        float shininess = (texture2D(tSpecular, vec2(vUv.s, vUv.t)).r * 255.0) + 0.1; // Apparament incorect > le pow() a besoin d'une virgule
        vec3 reflectionDirection = reflect(-v3LightPosition, vNormal);
        float specularLightWeighting;
        specularLightWeighting = pow(max(dot(reflectionDirection, v3Direction), 0.0), shininess);//Shininess 20

        float diffuseLightWeighting = max(dot(vNormal, v3LightPosition), 0.0);

        vec3 uAmbientColor = vec3(1, 1, 1);
        vec3 uPointLightingSpecularColor = vec3(1, 1, 1);
        vec3 uPointLightingDiffuseColor = vec3(1, 1, 1);

        vec3 lightWeighting = uAmbientColor
        + uPointLightingSpecularColor * specularLightWeighting
        + uPointLightingDiffuseColor * diffuseLightWeighting;
        

        //vec3 lightWeighting = vec3(1, 1, 1);

        vec4 fragmentColor = vec4(1.0, 1.0, 1.0, 1.0);
        vec4 temp = vec4(fragmentColor.rgb * lightWeighting, fragmentColor.a);

        //float mid = 0.5;
        //float vRotation = 1.57;
        //vec2 rotated = vec2(cos(vRotation) * (gl_PointCoord.x - mid) + sin(vRotation) * (gl_PointCoord.y - mid) + mid,
            //cos(vRotation) * (gl_PointCoord.y - mid) - sin(vRotation) * (gl_PointCoord.x - mid) + mid);


        vec3 diffuseTex = texture2D( tDiffuse, vUv ).xyz;
        vec3 diffuseNightTex = texture2D( tDiffuseNight, vUv ).xyz;

        vec3 day = diffuseTex * c0;
        vec3 night = fNightScale * diffuseNightTex * diffuseNightTex * diffuseNightTex * (1.0 - c0);

        gl_FragColor = vec4(c1, 1.0) + vec4(day + night, 1.0);
        */

        vec3 diffuseTex = texture2D( tDiffuse, vUv ).xyz;
        vec3 diffuseNightTex = texture2D( tDiffuseNight, vUv ).xyz;

        vec3 day = diffuseTex * c0;
        vec3 night = fNightScale * diffuseNightTex * diffuseNightTex * diffuseNightTex * (1.0 - c0);

        gl_FragColor = vec4(c1, 1.0) + vec4(day + night, 1.0);

        //ORIGINAL
        /*
        vec3 diffuseTex = texture2D( tDiffuse, vUv ).xyz;
        vec3 diffuseNightTex = texture2D( tDiffuseNight, vUv ).xyz;

        vec3 day = diffuseTex * c0;
        vec3 night = fNightScale * diffuseNightTex * diffuseNightTex * diffuseNightTex * (1.0 - c0);

        gl_FragColor = vec4(c1, 1.0) + vec4(day + night, 1.0);
        */
    }
</script>


















<script id="vertexCloud" type="x-shader/x-fragment">
    //
    // Atmospheric scattering vertex shader
    //
    // Author: Sean O'Neil
    //
    // Copyright (c) 2004 Sean O'Neil
    //
    // Ported for use with three.js/WebGL by James Baicoianu

    uniform vec3 v3LightPosition;		// The direction vector to the light source
    uniform vec3 v3InvWavelength;	// 1 / pow(wavelength, 4) for the red, green, and blue channels
    uniform float fCameraHeight;	// The camera's current height
    uniform float fCameraHeight2;	// fCameraHeight^2
    uniform float fOuterRadius;		// The outer (atmosphere) radius
    uniform float fOuterRadius2;	// fOuterRadius^2
    uniform float fCloudRadius;		// The inner (planetary) radius
    uniform float fCloudRadius2;	// fInnerRadius^2
    uniform float fKrESun;			// Kr * ESun
    uniform float fKmESun;			// Km * ESun
    uniform float fKr4PI;			// Kr * 4 * PI
    uniform float fKm4PI;			// Km * 4 * PI
    uniform float fScale;			// 1 / (fOuterRadius - fInnerRadius)
    uniform float fScaleDepth;		// The scale depth (i.e. the altitude at which the atmosphere's average density is found)
    uniform float fScaleOverScaleDepth;	// fScale / fScaleDepth
    uniform sampler2D tDiffuseCloud;

    varying vec3 v3Direction;
    varying vec3 c0;
    varying vec3 c1;
    varying vec3 vNormal;
    varying vec2 vUv;
    varying vec2 testCoord;

    const int nSamples = 3;
    const float fSamples = 3.0;

    float scale(float fCos)
    {
        float x = 1.0 - fCos;
        return fScaleDepth * exp(-0.00287 + x*(0.459 + x*(3.83 + x*(-6.80 + x*5.25))));
    }

    void main(void)
    {
        // Get the ray from the camera to the vertex and its length (which is the far point of the ray passing through the atmosphere)
        vec3 v3Ray = position - cameraPosition;
        float fFar = length(v3Ray);
        v3Ray /= fFar;

        // Calculate the closest intersection of the ray with the outer atmosphere (which is the near point of the ray passing through the atmosphere)
        float B = 2.0 * dot(cameraPosition, v3Ray);
        float C = fCameraHeight2 - fOuterRadius2;
        float fDet = max(0.0, B*B - 4.0 * C);
        float fNear = 0.5 * (-B - sqrt(fDet));

        // Calculate the ray's starting position, then calculate its scattering offset
        vec3 v3Start = cameraPosition + v3Ray * fNear;
        fFar -= fNear;
        float fDepth = exp((fCloudRadius - fOuterRadius) / fScaleDepth);
        float fCameraAngle = dot(-v3Ray, position) / length(position);
        float fLightAngle = dot(v3LightPosition, position) / length(position);
        float fCameraScale = scale(fCameraAngle);
        float fLightScale = scale(fLightAngle);
        float fCameraOffset = fDepth*fCameraScale;
        float fTemp = (fLightScale + fCameraScale);

        // Initialize the scattering loop variables
        float fSampleLength = fFar / fSamples;
        float fScaledLength = fSampleLength * fScale;
        vec3 v3SampleRay = v3Ray * fSampleLength;
        vec3 v3SamplePoint = v3Start + v3SampleRay * 0.5;

        // Now loop through the sample rays
        vec3 v3FrontColor = vec3(0.0, 0.0, 0.0);
        vec3 v3Attenuate;
        for(int i=0; i<nSamples; i++)
        {
            float fHeight = length(v3SamplePoint);
            float fDepth = exp(fScaleOverScaleDepth * (fCloudRadius - fHeight));
            float fScatter = fDepth*fTemp - fCameraOffset;
            v3Attenuate = exp(-fScatter * (v3InvWavelength * fKr4PI + fKm4PI));
            v3FrontColor += v3Attenuate * (fDepth * fScaledLength);
            v3SamplePoint += v3SampleRay;
        }

        // Calculate the attenuation factor for the ground
        c0 = v3Attenuate;
        c1 = v3FrontColor * (v3InvWavelength * fKrESun + fKmESun);

      gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
      //testCoord = gl_TextureMatrix[1] * gl_MultiTexCoord1;
        //gl_TexCoord[0] = gl_TextureMatrix[1] * gl_MultiTexCoord1;
        //gl_TexCoord[1] = gl_TextureMatrix[1] * gl_MultiTexCoord1;
      vUv = uv;
      vNormal = normal;
    }
</script>

<script id="fragmentCloud" type="x-shader/x-fragment">
    //
    // Atmospheric scattering fragment shader
    //
    // Author: Sean O'Neil
    //
    // Copyright (c) 2004 Sean O'Neil
    //
    // Ported for use with three.js/WebGL by James Baicoianu

    //uniform sampler2D s2Tex1;
    //uniform sampler2D s2Tex2;

    uniform float fNightScale;
    uniform vec3 v3LightPosition;
    uniform sampler2D tDiffuseCloud;

    varying vec3 c0;
    varying vec3 c1;
    varying vec3 vNormal;
    varying vec2 vUv;
    varying vec3 v3Direction;

    void main (void)
    {
        //gl_FragColor = vec4(c0, 1.0);
        //gl_FragColor = vec4(0.25 * c0, 1.0);
        //gl_FragColor = gl_Color + texture2D(s2Tex1, gl_TexCoord[0].st) * texture2D(s2Tex2, gl_TexCoord[1].st) * gl_SecondaryColor;

        vec3 diffuseTex = texture2D( tDiffuseCloud, vUv ).xyz;

        vec3 dayCloud = diffuseTex * c0;

        gl_FragColor = vec4(dayCloud, 1.0);
    }
</script>

<?php 
if(!$debug){
?>
    <script src="js/build/main.min.js"></script>
    <script>
      (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
      (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
      m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
      })(window,document,'script','//www.google-analytics.com/analytics.js','ga');

      ga('create', 'UA-46723031-1', 'spope.fr');
      ga('send', 'pageview');

    </script>
<?php
}else {
?>
    <script src="js/nasaRequest.js"></script>
    <script src="js/nasaWebservice.js"></script>
    <script src="js/main.js"></script>
    <script src="js/action.js"></script>
<?php
}   
?>

</html>
