var $ = require("zepto");
var http = require("ajax");
var tip = require("kami/tip");
var tpl = require("./patientclinic.hbs");
var query = require('query');
var Handlebars = require("hbsfy/runtime");
/*获取对象属性值 */
Handlebars.registerHelper("formateTime", function(time) {
	if(time){
	var year = time.substr(0, 4);
	var month = time.substr(4, 2);
	var day = time.substr(6, 2);
	var hour = time.substr(8, 2);
	var minute = time.substr(10, 2);
	var second = time.substr(12, 2);
	return year + "-" + month + "-" + day + " " + hour + ":" + minute + ":" + second;
	}else{
		return "1970-01-01 12:00:00"
	}
});
$(function() {
	var openId = query.get().openid || "";
	console.log(openId);
	http.post({
		url: "/server/patient/findOrganizationByOpenid",
		data: JSON.stringify({
			"openid": openId
		}),
		contentType: "application/json",
		success: function(res) {
			console.log(res);
			!res.data && tip.show({
				content: res.desc
			});

			if(res.data) {
				var $dom = $(tpl(res));
				var $container = $("#container");
				$container.append($dom);
			}

		},
		error: function(err) {}

	});
	$(document).on("tap", ".js-clinicDetail", function() {
		var _id = $(this).attr("data-val");
		window.location.href = "/webapp/html/clinicdetails.html?id=" + _id;

	});
})