var body = document.body,
    html = document.documentElement;

function bindScrollBtn(to) {
    document.getElementById('btn-bottom').onclick = function () {
        scrollTo(document.body, to, 500);   
    }
}

function setImg(src){
    document.getElementById('img-scroll').src = 'img/'+src;
}

function scrollTo(element, to, duration) {
    var start = element.scrollTop,
        change = to - start,
        currentTime = 0,
        increment = 20;

    var animateScroll = function(){        
        currentTime += increment;
        var val = Math.easeInOutQuad(currentTime, start, change, duration);
        element.scrollTop = val;
        if(currentTime < duration) {
            setTimeout(animateScroll, increment);
        }else{
            //finish
        }
    };
    animateScroll();
}

var height = Math.max( body.scrollHeight, body.offsetHeight, 
    html.clientHeight, html.scrollHeight, html.offsetHeight );

bindScrollBtn(height);

window.onscroll = function(e) {
    
    if(document.body.scrollTop > 1) {
        bindScrollBtn(0);
        setImg('up.png');
    }else{
        bindScrollBtn(height);
        setImg('bottom.png');
    }
}

//t = current time
//b = start value
//c = change in value
//d = duration
Math.easeInOutQuad = function (t, b, c, d) {
	t /= d/2;
	if (t < 1) return c/2*t*t + b;
	t--;
	return -c/2 * (t*(t-2) - 1) + b;
};
