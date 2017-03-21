require('../libs/rem.js');
function prevent(evt) {
	evt.preventDefault();
}
function stopPop(evt) {
  evt.stopPropagation();
}

function scrollFix(elem) {
	// Variables to track inputs
	var startY, startTopScroll;
	
	// If there is no element, then do nothing	
	if(!elem)
		return;

	// Handle the start of interactions
	elem.addEventListener('touchstart', function(event){
		startY = event.touches[0].pageY;
		startTopScroll = elem.scrollTop;
		
		if(startTopScroll <= 0)
			elem.scrollTop = 1;

		if(startTopScroll + elem.offsetHeight >= elem.scrollHeight)
			elem.scrollTop = elem.scrollHeight - elem.offsetHeight - 1;
	}, false);

};
document.addEventListener("DOMContentLoaded",function(evt) {
  var gmain, doms;
  if (document.querySelector) {
    gmain = document.querySelector(".g-main");
  } else if (document.getElementsByClassName) {
    gmain = document.getElementsByClassName("g-main")[0];
  } else {
    doms = document.getElementsByTagName("div");
    for (var i=0 ,l = doms.length; i < l ; i++) {
      if (~doms[i].className.indexOf("g-main")) {
        gmain = doms[i];
        break;
      }
    }
  }
  if (gmain) {
    gmain.parentNode.style.overflow = "auto";
    //document.addEventListener("touchstart", prevent, false);
    document.addEventListener("touchmove", prevent, false);
    //gmain.addEventListener("touchstart", stopPop, false); 
    gmain.addEventListener("touchmove", stopPop, false); 
    scrollFix(gmain);
  }

},false);

