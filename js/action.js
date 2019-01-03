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
    var start = window.scrollY,
        change = to - start,
        currentTime = 0,
        increment = 20;

    var animateScroll = function(){
        currentTime += increment;
        var val = Math.easeInOutQuad(currentTime, start, change, duration);
        console.log(val);
        window.scroll(0, val);
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

window.onscroll = debounce(function() {
    if (window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0 > 1) {
        bindScrollBtn(0);
        setImg('up.png');
    } else {
        bindScrollBtn(height);
        setImg('bottom.png');
    }
}, 100);

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

function debounce(func, wait, immediate) {
    var timeout;
    return function() {
        var context = this, args = arguments;
        var later = function() {
                    timeout = null;
                    if (!immediate) func.apply(context, args);
                };
        var callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
};

//document.body.addEventListener('wheel', function (e) {
    //e.preventDefault();
    //e.stopPropagation();

    //return false;
//});
