var $ = require("zepto");
var http= require("ajax");
require("../../exports/common.js");
var tip = require("kami/tip");
var orderdetail_tpl = require("./orderdetail.hbs");
var query = require('query');
var jsmath = require("jsmath");
var Handlebars = require("hbsfy/runtime");
/*获取对象属性值 */
Handlebars.registerHelper("getobjVal", function(obj) {
	var value;
	for(index in obj) {
		value = obj[index];
	}
	return value;
});
Handlebars.registerHelper("getobjKey",function(obj){
	var key;
	for(currKey in obj){
		key=currKey;
	}
	
	return key;
	
});
$(function() {
	var $container = $("#container");
	var apptId = query.get().appid || ""
	apptId && (function(apptId) {
		http.post({
			url: "/server/appointWx/findAppointByIdWx",
			data: JSON.stringify({
				"apptId": apptId
			}),
			success: function(res) {
				if(!res.data) {
					tip.show({
						content: res.desc
					});
					return;
				}
				console.log(res.data);
				var data = transfromData(res.data);
				$container.empty().append(orderdetail_tpl(data));
				hzid = data.patientId;
				
			},
			error: function(error) {
				console.log(error);

			}
		});

	})(apptId);
	/*转换预约的数据*/
	function transfromData(data) {
		console.log("转化");
		console.log(data);
		data.patientGender = data.patientGender == "1" ? "男" : "女 ";
		data.apptDate = data.apptTimeBegin.split(" ")[0].split("/").join("-");
		data.apptTime = data.apptTimeBegin.split(" ")[1];
    var duration = data.duration;
    data.durationKey=duration;
    data.duration = jsmath.mul(duration , 60) + "分钟";

		return data;
	}
     $(document).on("tap",".js-editorder",function(){
     	 window.location.href="addorder.html?appid=" +apptId+"&editOrder=1";
     });
});
