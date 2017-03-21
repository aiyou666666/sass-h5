var Zepto = window.Zepto;
Zepto.fn.outerWidth = function(){
    return Zepto.fn.width.call(this);  
} 
Zepto.fn.outerHeight = function(){
    return Zepto.fn.height.call(this);  
};

module.exports = Zepto;
