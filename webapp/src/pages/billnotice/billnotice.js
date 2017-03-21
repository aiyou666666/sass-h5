var $ = require("zepto");
var http = require("ajax");
var tpl = require("./billnotice.hbs");
var query = require('query');
var tip = require("kami/tip");
$(function() {
	var sfjlId = query.get().sfjlId;
	var _data = {
		"sfjlId": sfjlId
	};

	http.post({
		url: "/server/notice/feeDetail",
		data: JSON.stringify(_data),
		success: function(res) {
			console.log(res);
			!res.data && tip.show({
				content: res.desc
			});
			if (!res.data) return;
			var $dom = $(tpl(res.data));
			var $container = $("#container");
			$container.append($dom);
		},
		error: function(err) {

		}
	});

})