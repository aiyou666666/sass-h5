var $ = require("zepto");
var http = require("ajax");
var tip = require("kami/tip");
var loading = require("kami/loading");
var Calendar = require('kami/popcalendar');
var confirm = require("kami/confirm");
var store = require("store");
require("../../exports/common.js");
var feesettlement_tpl = require("./feesettlement.hbs");
var Popselect = require("kami/popselect");
var query = require('query');
var jsmath = require("jsmath");
$(function() {
	var $container = $("#container");
	var chargeData = store.get("chargeData");
	$container.append(feesettlement_tpl(chargeData));
	var $shishouVal = $(".shishouVal"),
		$zhaolinVal = $(".zhaolinVal"),
		$beizhuMsg = $(".beizhuMsg"),
		$MoneyInput = $(".m-paymethod  input"),
		shishouMoney = 0,
		isSubmit = false,
	    checkedSize=0;
		
	$(document).on("tap", ".checkbox", function() {
		
		var payMthedMsg=$(this).attr("data-val");
		if(payMthedMsg=="4"){
			    if(!chargeData.zhye){
			    	tip.show({
			    		 content:"没有余额"
			    	});
			    	return;
			    }
			}
		var isChecked = $(this).hasClass("checked");
		if(isChecked) {
			$(this).removeClass("checked");
			$(this).parent().find("input").hide();
			$(this).parent().find("input").val("");
			$(this).parent().find(".unit").hide();
			if(checkedSize==0) return;
			checkedSize--;

		} else {
			if(checkedSize==2){
				tip.show({
					content:"最多只能选择两种"
				});
				return;
			}
			$(this).addClass("checked");
			$(this).parent().find("input").show();
			$(this).parent().find(".unit").show();
			
			checkedSize++;
		}
		//判断找零 和实收
		shishouMoney = 0;
		$MoneyInput.each(function(index, el) {
			var currVal = $(this).val();
			if(currVal != '') {
				shishouMoney = jsmath.add(shishouMoney,parseFloat(currVal));
			}
		});
		$(".shishouVal").find("i").empty().html(shishouMoney);
		$(".zhaolinVal").find("i").empty().html(jsmath.sub(shishouMoney,chargeData.ysje));

	});

	//结算
	$(document).on("tap", ".js-jiesuan", function() {
		if(isSubmit) {
			tip.show({
				content: "请不要重复结算"
			});
			return;
		}
		var jiesuanData = {};
		jiesuanData.sfjlId = chargeData.sfjlId; //收费记录Id
		jiesuanData.yfje = chargeData.ysje; //应付金额
		jiesuanData.hzId = chargeData.hzId; //患者Id
		jiesuanData.sm = $beizhuMsg.val() || ""; //备注说明
		jiesuanData.zl = $zhaolinVal.html(); //找零
		jiesuanData.ssje = 0;
		jiesuanData.zl = 0;
		if($(".checked").length == 0) {
			tip.show({
				content: "请选择付款方式"
			});
			return;
		};
		$(".checked").each(function(index, el) {
			var moneyVal = $(this).parent().find("input").val();
			var payMthedMsg=$(el).attr("data-val");
			var paymethodTxt = $(this).parent().find("i").attr("data-val");
			if(moneyVal == '' || moneyVal == 0) {
				tip.show({
					content: "请填写金额"
				});
				return;
			}
			jiesuanData["fkfs" + payMthedMsg] = paymethodTxt;
			jiesuanData["fkje" + payMthedMsg] = moneyVal;
			jiesuanData.ssje = jsmath.add(jiesuanData.ssje, parseFloat(moneyVal));
		});
		jiesuanData.zl = (jsmath.sub(jiesuanData.ssje, parseFloat(jiesuanData.yfje))).toString();
		jiesuanData.ssje = jiesuanData.ssje.toString();
		jiesuanData.yfje = jiesuanData.yfje.toString();
		confirm.show({
			content: "实收金额:" + jiesuanData.ssje + "\r\n" + "找零:" + jiesuanData.zl,
			okText: '是',
			cancelText: '否',
			stylesObj: {},
			extraClass: 'yo-dialog-confirm',
			onok: function() {
				isSubmit = true;
				http.post({
					url: "/server/wxcharge/payWx",
					data: JSON.stringify(jiesuanData),
					success: function(res) {
						isSubmit = false;
						tip.show({
							content: res.desc
						});
						if(res.status == 0) {

							window.location.href = "/webapp/html/patientinfo.html?id=" + jiesuanData.hzId;
						}

					},
					error: function(error) {
						isSubmit = false;
					}
				});

			},
			oncancel: function() {
				confirm.destroy();
			}
		});
	});
	//动态改变实收金额和找零
	$(document).on("blur", ".m-paymethod input", function() {
		shishouMoney = 0;
		$MoneyInput.each(function(index, el) {
			var currVal = $(this).val();
			if(currVal != '') {
				shishouMoney = jsmath.add(shishouMoney, parseFloat(currVal))
			}
		});
		$(".shishouVal").find("i").empty().html(shishouMoney);

		$(".zhaolinVal").find("i").empty().html(jsmath.sub(shishouMoney, chargeData.ysje));

	});
	$(document).on("input", ".inputMoney", function() {
		var thisVal = $(this).val();
		var thisMthed=$(this).attr("data-val");
		$(this).val($(this).val().replace(/\u4e00-\u9fa5/, ''));
		if(thisVal.length > 9) {
			$(this).val(thisVal.substr(0, 9));
		}
		if(thisMthed=="4"){
			if(thisVal>chargeData.zhye){
				tip.show({
					content:"余额不足"
				});
				$(this).val("");
				return;
			}
		}
	});
	$(document).on("tap", ".js-back", function() {
		window.location.href="/webapp/html/patientinfo.html?id="+chargeData.hzId+"&from=patientlist"
	});

})