var $ = require("zepto");
var http = require("ajax");
var tpl = require("./clinicdetails.hbs");
var query = require('query');
var tip = require("kami/tip");
$(function() {
	var jg_id = query.get().id || '' ;
	var _data = {
		"jg_id": jg_id
	};
	http.post({
		url: "/server/patient/findOrgByJgid",
		data: JSON.stringify(_data),
		success: function(res) {
			console.log(res);

			!res.data && tip.show({
				content: res.desc
			});
			if(!res.data) return;
			var $dom = $(tpl(res.data));
			var $container = $("#container");
			$container.append($dom);
		}
	});
	$(document).on("tap",".js-back",function(){
		  window.history.back();
	});
})