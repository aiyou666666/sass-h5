var $ = require("./zepto.js");
var store=require("store");

var def_opt = {
    cache : false,
    dataType : "json"
};
var ajax = function(opt){
	opt.contentType=opt.contentType || "application/json";
	opt.data=typeof opt.data=="string"?(function(){
		/*让每一个请求都带一个token*/
		 opt.data=JSON.parse(opt.data);
		 opt.data.token=store.get("token")||"";
	     opt.data=JSON.stringify(opt.data);
	     return opt.data;
	 })():opt.data;
    var _success = opt.success;
    opt.success = function(rs) {
      var status = rs.status;
      if (status == -2 && !~location.href.indexOf("/webapp/html/login.html")) {
        alert("用户过期请重新登录");
        window.location.href = "/webapp/html/login.html";
      }
      var args = [].slice.call(arguments,0);
      _success && _success.apply(opt.context, args);
    }
    opt = $.extend({},def_opt , opt );
    return $.ajax(opt);
};

var http = {
    get : function(opt){
        opt.type = "get";
        return ajax(opt);
        
    },
    post : function(opt){
        opt.type = "post";

        return ajax(opt);
    }
};

module.exports = http;
