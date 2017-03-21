var $ = require("zepto");
var http = require("ajax");
var tip = require("kami/tip");
var loading = require("kami/loading");
var Calendar = require('kami/popcalendar');
var store = require("store");
require("../../exports/common.js");
var workmanger_tpl = require("./workmanger.hbs");
$(function() {
	var $searchItem, $item, itemList = ["按年", "按日期"],
		$timeSearch, $detailTime;
		var currDate=new Date();
		var curryear=currDate.getFullYear();
		var currMonth=(currDate.getMonth()+1) > 10 ? (currDate.getMonth()+1) :"0"+(currDate.getMonth()+1);
		var curryearMonth=curryear+"-"+currMonth;
		var currDate=curryear+"-"+currMonth+"-"+(currDate.getDate()>10 ? currDate.getDate() : "0"+currDate.getDate());
	var postData = {
		"timeType": "2",   //1为按年  2 按月  3按天
		"checkTime": curryearMonth
	};
	getDataByTime(postData,curryearMonth,"按月份");

	$(document).on("tap", ".js-timeSearch", function() {
		$searchItem.show();
	});
	$(document).on("tap", ".m-item", function() {
		var currtxt = $timeSearch.html();
		var _thisVal=$(this).html();
		var index = itemList.indexOf(_thisVal);
		$searchItem.hide();
		$timeSearch.html($(this).html());
		itemList = itemList.splice(index-1, 1);
		itemList.push(currtxt);
		if(_thisVal=="按年"){
			$detailTime.empty().html(curryear);
			postData.timeType="1";
			postData.checkTime=curryear+"";
		}else if(_thisVal=="按月份"){
			$detailTime.empty().html(curryearMonth);
			postData.timeType="2";
			postData.checkTime=curryearMonth;
		}else if(_thisVal=="按日期"){
			$detailTime.empty().html(currDate);
			postData.timeType="3";
			postData.checkTime=currDate;
			
		}
		now=$detailTime.html();
		getDataByTime(postData,now,_thisVal,function(){
		     $searchItem.empty().html("<div class='m-item bottomLine'>" + itemList[0] + "</div><div class='m-item'>" + itemList[1] + "</div>");

		});
	});
	$(document).on("tap", ".m-detailTime", function() {
		var _thisVal = $timeSearch.html(),
			_formateKey, _now, _dateRange;
		if (_thisVal == "按年") {
			_formateKey = "year";
			postData.timeType='1';
		} else if (_thisVal == "按月份") {
			_formateKey = "month";
			postData.timeType='2';
		} else if (_thisVal == "按日期") {
			_formateKey = "date";
			postData.timeType='3';
			
		}
		_dateRange = ["2000-01-01", currDate];
		var options = {
			container: '#container',
			extraClass: 'yo-dialog-select',
			frmateKey: _formateKey, //按年 按月份 按日期
			duration: 0.5,
			displayCount: 5,
			now:currDate,
			dateRange:_dateRange
		};
		var calendar = new Calendar(options);
		calendar.show();
		calendar.on('ok', function(hide) {
			var val = calendar.getValue();
			var now = [];
			val.year  && now.push(val.year.value);
			val.month && (function(){ val.month.value + 1 > 10 ? now.push(val.month.value + 1) : now.push('0' + (val.month.value + 1))})();
			val.date  && (function(){ val.date.value > 10 ? now.push(val.date.value) : now.push('0' + (val.date.value))})();
			$detailTime.empty().html(now.join('-'));
		    postData.checkTime=now.join("-");
		    //获取数据重新渲染模板
		    getDataByTime(postData,now.join('-'),_thisVal,null);
			calendar.destroy();
		})
		calendar.on('cancel', function(hide) {
			this.destroy();
		});

	});

	function getDataByTime(data,now,currMethd,callback) {
		http.post({
			url: "/server/busi/findJgBusiByMonth",
			data: JSON.stringify(data),
			success: function(res) {
				if (!res.data) {
					tip.show({
						content: res.desc,
					});
					return;
				}
			    res.data.currData=now;
			    res.data.currMethd=currMethd;
				var _data=tansformData(res.data);
				var $dom = $(workmanger_tpl(res.data));
				var $container = $("#container");
				$container.empty().append($dom);
				$searchItem = $(".m-searchItem");
				$timeSearch = $(".js-timeSearch")
				$item = $(".m-item");
				$detailTime = $(".m-detailTime");
				callback&&callback();
			}
		});
	}
    function tansformData(data){
    	data.hfl=data.hfl < 0 ? 0 : (data.hfl*100).toFixed(0);
    	data.czl=data.czl < 0 ? 0 : (data.czl*100).toFixed(0);
    	data.yyl=data.yyl < 0 ? 0 : (data.yyl*100).toFixed(0);
    	
    	return data;
    }
})