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
    <script src="js/build/lib.min.js?v=1"></script>
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
            <img id="img-scroll" src="img/bottom.png" width="40" height="40" />
        </a>
    </div>
</div>

<div class="container">
    <div class="row">
        <h1 class="col-md-12">ISS Position</h1>

        <div class="col-md-12">
            <p>This shows the ISS position (and the moon if you can spot it) in real time. Positions are retrieved from <a href="http://sscweb.gsfc.nasa.gov/WebServices/REST/" title="NASA SSC Rest API" target="_blank">NASA SSC</a>. You can check that the positions are correct <a href="http://www.esa.int/Our_Activities/Human_Spaceflight/International_Space_Station/Where_is_the_International_Space_Station" title="Where is the International Space Station ?" target="_blank">here</a> or by looking the real time ISS streaming <a title="ISS HD Earth Viewing Experiment" href="http://www.ustream.tv/channel/iss-hdev-payload" target="_blank">here</a>.<br />
            Sun position is estimated from current time and date. Earth tilt "vary" form -23.45° (December 22) to +23.45° (June 21). Today tilt is calculated with <a href="http://pveducation.org/pvcdrom/2-properties-sunlight/declination-angle" title="Earth Tilt calculation" target="_blank">this equation</a>.</p>
            <p>The scene is made using <a href="http://threejs.org/" title="Three.js" target="_blank">Three.js</a>. Earth shader is made by <a href="http://http.developer.nvidia.com/GPUGems2/gpugems2_chapter16.html" title="Sean O'Neil Atmospheric Scattering" target="_blank">Sean O'Neil</a>, ported for use with three.js/WebGL by James Baicoianu.</p>
            <br />
            <p>Milky Way picture source : <a href="http://www.eso.org/public/images/eso0932a/" title="ESO Milky Way Panorama">ESO / S.Brunier</a>.<br />
            If you have any questions or suggestions, feel free to conctact me on <a href="https://twitter.com/spopila" title="Spopila" target="_blank">Twitter</a>.</p>
            <br />
            <p>Made by <a href="http://spope.fr" title="Spope's portfolio">Spope</a>.</p>
            <p>You can also look at my other space project, <a href="http://projects.spope.fr/curiosity" title="Curiosity's Trip">Curiosity's Trip</a></p>
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
        <img class="description-img" src="img/screenshot.png" />
    </div>
</div>
</body>

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
    <script src="js/shader.js"></script>
    <script src="js/nasaRequest.js"></script>
    <script src="js/nasaWebservice.js"></script>
    <script src="js/main.js"></script>
    <script src="js/action.js"></script>
<?php
}   
?>

</html>
