var $=require("zepto");
var http=require("ajax");
var tpl=require("./bookingnotice.hbs");
var query = require('query');
var tip = require("kami/tip");

$(function(){
	var id= query.get().id||"";
	var _data={"id":id};
	
	 http.post({
	 	url:"/server/notice/appointmentDetail",
	 	data:JSON.stringify(_data),
	 	success:function(res){
	 		!res.data && tip.show({
	 			content:"数据出错"
	 		});
	 		if(!res.data){
	 			return
	 		};
	 		var $dom=$(tpl(res.data));
			var $container=$("#container");
			$container.append($dom);
	 	},
	 	error:function(err){}
	 });
	 $(document).on("tap",".js-back",function(){
	 	 window.history.back();
	 });
	
	
})
