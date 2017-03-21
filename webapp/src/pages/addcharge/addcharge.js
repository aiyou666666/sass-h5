var $ = require("zepto");
var http = require("ajax");
var tip = require("kami/tip");
var loading = require("kami/loading");
var Calendar = require('kami/popcalendar');
var store = require("store");
var config = require('../config.js');
require("../../exports/common.js");
var addcharge_tpl = require("./addcharge.hbs");
var Popselect = require("kami/popselect");
var query = require('query');
var jsmath = require("jsmath");
$(function() {
	var $container = $("#container");
	var $doctorVal, //医生
		$nurseVal, //护士
		$assisVal, //助理
		$synPrice, //综合收费
		$kouneiPrice, //口内治疗
		$gudingPrice, //固定修复
		$huodongPrice, //活动修复
		$jiezhiPrice, //洁治费
		$bayaPrice, //拔牙费
		$zhongzhiPrice, //种植
		$zhengjiPrice, //正畸
		$fangshePrice, //放射
		$mayaoPrice, //麻药
		$xiyaoPrice, //西药
		$shoushuPrice, //手术
		$qitaPrice, //其他
		$huodongPriceVal,
		$synPriceVal,
		$kouneiPriceVal,
		$gudingPriceVal,
		$jiezhiPriceVal,
		$bayaPriceVal,
		$zhongzhiVal,
		$zhengjiVal,
		$fangsheVal,
		$mayaoVal,
		$xiyaoVal,
		$shoushuVal,
		$qitaVal,
		$qianfeiVal,
		totalPrice = 0,
		isSubmit = false,
		$jianlvShoufei;

	var hzId = query.get().hzId || '';
	var sfjlId = query.get().sfjlId || '';
	var _data = {
		"hzId": hzId
	};
	var jlData = {
			"sfjlId": sfjlId
		}
		//获取患者信息
	http.post({
		url: "/server/wxcharge/findPatientAccountWx",
		data: JSON.stringify(_data),
		beforeSend: function() {
			loading.show();
		},
		success: function(res) {
			loading.hide();
			res.data != null && (function(data) {
				zhye=data.zhye;
				if(!sfjlId) {
					data.title="新增收费";
					$container.append(addcharge_tpl(transfromData(data)));
					initDom();
					return;
				}
				getchargeinfo(data, function(newData) {
					newData.title="编辑收费";
					$container.append(addcharge_tpl(transfromData(newData)));
					initDom();
				});

			})(res.data);

			//数据返回空时 提示错误
			!res.data && tip.show({
				content: res.desc
			});

		},
		error: function(error) {

		}
	});

	//获取相关人员信息
	function getUserByJob(pos) {
		var _data = {
				"zw": pos
			},
			usersData;
		http.post({
			url: "/server/wxcharge/findPositionUser",
			data: JSON.stringify(_data),
			async: false,
			success: function(res) {
				res.data && (usersData = res.data);
				!res.data && tip.show({
					content: res.desc
				});

			},
			error: function(err) {

			}
		});
		return usersData;
	}

	//获取收费记录
	function getchargeinfo(data, callback) {
		http.post({
			url: "/server/wxcharge/findChargeShortByhzId",
			data: JSON.stringify(jlData),
			success: function(res) {
				for(index in data) {
					res.data[index] = data[index];
				}
				callback && callback(res.data);
			},
			error: function(error) {

			}
		});
	}

	//添加收费
	$(document).on("tap", ".js-addcharge", function() {
		if(isSubmit) {
			tip.show({
				content: "请不要重复提交"
			});
			return;
		}
		$huodongPriceVal = $huodongPrice.val();
		$gudingPriceVal = $gudingPrice.val();
		$kouneiPriceVal = $kouneiPrice.val();
		$jiezhiPriceVal = $jiezhiPrice.val();
		$synPriceVal = $synPrice.val();
		$bayaPriceVal = $bayaPrice.val();
		$zhongzhiVal = $zhongzhiPrice.val();
		$zhengjiVal = $zhengjiPrice.val();
		$fangsheVal = $fangshePrice.val();
		$mayaoVal = $mayaoPrice.val();
		$xiyaoVal = $xiyaoPrice.val();
		$shoushuVal = $shoushuPrice.val();
		$qitaVal = $qitaPrice.val();
		totalPrice = 0;

		/*	totalPrice = [{
				val: $synPriceVal,
				text: "综合收费"
			}, {
				val: $kouneiPriceVal,
				text: "口内治疗"
			}, {
				val: $gudingPriceVal,
				text: "固定修复"
			}, {
				val: $huodongPriceVal,
				text: "活动修复"
			}, {
				val: $jiezhiPriceVal,
				text: "洁治费"
			}, {
				val: $bayaPriceVal,
				text: "拔牙费"
			}];*/
		//判断总费用非空
		/*var totalLength=totalPrice.length;
		for(var i=0;i<totalLength;i++){
			  if(totalPrice[i].val==0 || totalPrice[i].val==''){
			  	tip.show({
			  		content:totalPrice[i].text+"不能为空"
			  	});
			  	return;
			  }
		}*/
		$inPutMoney.each(function(index, el) {
			var priceVal = $(el).val() || 0;
			totalPrice = jsmath.add(totalPrice, parseFloat(priceVal));

		});
		if(totalPrice <= 0) {
			tip.show({
				content: "总费用必须大于0"
			});
			return;
		}
		if(totalPrice >= 100000000) {
			tip.show({
				content: "总费用不能大于一亿"
			});
			return;
		}
		var chargeData = {
			"hzId": hzId,
			"sfjlId":sfjlId ||'',
			 "id":$jianlvShoufei.attr("data-id") || '',
			"ssf": $shoushuVal || '0',
			"xyf": $xiyaoVal || '0',
			"myf": $mayaoVal || '0',
			"fsf": $fangsheVal || '0',
			"zjf": $zhengjiVal || '0',
			"hdxf": $huodongPriceVal || '0', //活动
			"gdxf": $gudingPriceVal || '0', //固定
			"zyf": $zhongzhiVal || '0',
			"byf": $bayaPriceVal || '0', //拔牙
			"knzl": $kouneiPriceVal || '0', //口内
			"jzf": $jiezhiPriceVal || '0', //洁疗
			"zhsf": $synPriceVal || '0', //综合
			"ysje": totalPrice || '0',
			"zqqk": $qianfeiVal.html() || '0',
			"zl": $assisVal.attr("data-id") || '',
			"hs": $nurseVal.attr("data-id") || '',
			"ys": $doctorVal.attr("data-id") || '',
			"qt":$qitaVal ||'0'
		}
		isSubmit = true;

		/*提交数据*/
		http.post({
			url: "/server/wxcharge/saveChagerWx",
			data: JSON.stringify(chargeData),
            success: function(res) {
				res.data && (function() {
					store.set("chargeData", res.data);
					store.remove('avatar');
					window.location.href = "/webapp/html/feesettlement.html"
				})();
				!res.data && tip.show({
					content: res.desc
				}, function() {
					store.remove('chargeData');
				});
				isSubmit = false;
			},
			error: function(error) {
				isSubmit = false;
			}
		});

	});
	//转换数据
	function transfromData(data) {
    	data['avatar'] = store.get('avatar') || (data.xb == '1' ? config.defaultAvatarMale : config.defaultAvatarFemale);
		data.xb = data.xb == '1' ? '男' : '女';
		data.zhye = data.zhye * 1 >= 0  ? data.zhye : '0';
		data.age = (new Date()).getFullYear() - (data.csrq && data.csrq.substr(0, 4)) || 0;
		return data;
	}
	//生成滑动框
	function initPopSelect(datasource, callback) {
		var okvalueTxt,yh_id;
		var options = {
			extraClass: 'yo-dialog-select',
			displayCount: 5,
			title: '',
			effect: false,
			datasource: datasource,
			infinite: false,
		}
		var popselect = new Popselect(options);
		popselect.show();
		popselect.on('ok', function(hide) {
			var _val = this.getValue();
			okvalueTxt = _val.matter.text;
			yh_id=_val.matter.value;
			callback && callback(okvalueTxt,yh_id);
			this.destroy();
		});
		popselect.on('cancel', function(hide) {
			this.destroy();
		});
	}

	//选择相关人员
	$(document).on("tap", ".js-getPosUser", function() {
		var userlist, userType, scope = this,
			currVal;
		userType = $(this).attr("data-val");
		userlist = getUserByJob(userType);
		currVal = $(this).find(".currVal").html();
		if(userlist.length == 0) {
			tip.show({
				content: "没有相关人员"
			});
			return;
		}

		var datasource = [{
			key: 'matter',
			datasource: [],
			value: currVal || '',
			tag: ''
		}];
		for(user in userlist) {
			var obj = {};
			obj.text = userlist[user].xm;
			obj.value = userlist[user].yh_id;
			datasource[0].datasource.push(obj);
			obj = null;
		};
		//初始化滑动框
		initPopSelect(datasource, function(val,id) {
			//获取值
			$(scope).find("span").last().empty().html(val).attr("data-id",id);

		});

	});
	$(document).on("input", ".inputMoney", function() {
    var $d = $(this);
    var thisVal = $.trim($d.val());
    var changed = false;
    thisVal = thisVal.replace(/\u4e00-\u9fa5/, '');

    if (!(thisVal.match(/^[0-9]+(\.[0-9]{1,2})?$/) || thisVal.match(/\d+\.$/))) {
      thisVal = thisVal * 1 || 0;
      changed = true;
    } else {
      if (thisVal.match(/^0\d+/)) {
        changed = true;
      }
      thisVal = thisVal * 1;
    }

    var sval = ""+thisVal;
    var dotStr = sval.split(".")[1];
    if (dotStr && dotStr.length > 2) {
      dotStr = dotStr.substring(0,2);
      thisVal = sval.split(".")[0]+"."+dotStr;
      thisVal = thisVal *1;
      changed = true;
    }


    if (thisVal > 10000000) {
      sval = ""+thisVal;
      num = sval.split(".")[0] , 
      dot = sval.split(".")[1];

      thisVal = num.substring(num.length - 8 , num.length ) + (dot ? ("."+dot) : "");
      changed = true;
    }

    if (changed) {
      $d.val(thisVal);
    }
	});

	function initDom() {
		$doctorVal = $(".doctorVal");
		$nurseVal = $(".nurseVal");
		$assisVal = $(".assisVal");
		$synPrice = $(".synPrice");
		$kouneiPrice = $(".kouneiPrice");
		$gudingPrice = $(".gudingPrice");
		$huodongPrice = $(".huodongPrice");
		$jiezhiPrice = $(".jiezhiPrice");
		$bayaPrice = $(".bayaPrice");
		$zhongzhiPrice = $(".zhongzhiPrice");
		$zhengjiPrice = $(".zhengjiPrice");
		$fangshePrice = $(".fangshePrice");
		$mayaoPrice = $(".mayaoPrice");
		$xiyaoPrice = $(".xiyaoPrice");
		$shoushuPrice = $(".shoushuPrice");
		$qitaPrice = $(".qitaPrice");
		$inPutMoney = $(".inputMoney");
		$qianfeiVal = $(".qianfeiVal");
		$jianlvShoufei=$(".jianlvShoufei");
	}

});
