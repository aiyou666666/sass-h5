var $ = require('zepto');
var http = require('ajax');
var Selectlist = require('kami/selectlist');
var query = require('query');
var store = require("store");
var config = require('../config.js');
var tip = require("kami/tip");
var header_tpl = require("./header.hbs");
var base_tpl = require("./baseinfo.hbs");
var charge_tpl = require("./chargeinfo.hbs");
var chage_patient_tpl = require('./chargepatient.hbs');
var charge_list_tpl = require('./chargelist.hbs');
var Handlebars = require("hbsfy/runtime");
 Handlebars.registerHelper("ifexp",function(v1,operator,v2,options) {
 switch (operator)
	    {
	    case "==":
	        return (v1==v2)?options.fn(this):options.inverse(this);
	   default:
	        return eval(""+v1+operator+v2)?options.fn(this):options.inverse(this);
	  }
});

var url = '/server/patient/findPatientById';
var chargeUrl = '/server/wxcharge/findChargeListWxByHzId';
var userChargeUrl = '/server/wxcharge/findPatientAccountWx';
var qrcodeUrl = '/server/patientQrCode/getQrCode';

var hzId = query.get().id;
var returnUrl = query.get().from ? query.get().from + '.html' : 'patientlist.html';

var baseData;
var chargePatientDom;
var chargeListDom;
var qrcode;
var hasShoufei=false;

$(function() {

    var $tabContent = $('#tab-content');
    var $tabBtn = $('.table-nav-item');
    var $header = $('header');
    var $tabBtnActive = $('.table-nav-item.active');
    var hzwxbm;

    store.remove('avatar');
    setList();
    getChargePatient();
    getChargeList();


    // 获取患者基本信息
    function setList() {
    	http.post({
            url: url,
            data: JSON.stringify({
            	"hzId": hzId
            }),
            success: function(res) {
                if ( res.status == '0') {
    				var data = res.data;
    				if (data) {
                        $header.html(header_tpl({
                            returnUrl: returnUrl,
                            name: data.xm,
                            id: data.hzId
                        }));
                        hzwxbm = data.hzwxbm + '';
                        data.zhzlrq = data.zhzlrq ? data.zhzlrq : '';
                        baseData = dataProcess(data);
                        setQrcode();
                        $tabContent.html(base_tpl(baseData));

    				}
                }
            }
        });
    }

    // 设置消费信息
    function setCharge() {
        $tabContent.html(charge_tpl({
            chargePatient: chargePatientDom,
            chargeList: chargeListDom
        }));

    }
    // 获取患者消费信息
    function getChargePatient() {
        http.post({
            url: userChargeUrl,
            data: JSON.stringify({
                "hzId": hzId
            }),
            success: function(res) {
                if ( res.status == '0') {
                    var data = res.data;

                    if (data) {
                        data.zhye = data.zhye * 1 > 0 ? data.zhye : 0;
                        chargePatientDom = chage_patient_tpl(data);
                    }
                }
            }
        });
    }
    function getChargeList() {
        http.post({
            url: chargeUrl,
            data: JSON.stringify({
            	"hzId": hzId
            }),
            success: function(res) {

                if ( res.status == '0') {
    				var data = res.data;
    			if (data) {
    			     //判断是否有未收费状态
	    			for(var i=0;i<data.length;i++){
	    			   for(index in data[i]){
	            		if(index=="sfzt" && data[i][index]=="1"){
	            			    hasShoufei=true;
	            		     }
	            	       }
	    			    }
    			     if(hasShoufei){
    			     	$(".js-addcharge").addClass("disabled");
    			     }

                        chargeListDom = charge_list_tpl({
                            items: chargeDataProcess(data)
                        });
                    }
                }
            }
        });
    }
    // 消费时间处理
    function chargeDataProcess(data) {
        var len = data.length;
        for (var i = 0; i < len; i ++) {
            if (data[i].sfsj) {
                data[i]['date'] = data[i].sfsj.substr(0,4) + '.' + data[i].sfsj.substr(4,2) + '.' + data[i].sfsj.substr(6, 2);
            }
        }
        return data;
    }

    // 患者数据处理
    function dataProcess(data) {
        var dateBirth = data.csrq || '2016';
        var temp = data.jws && (data.jws.indexOf('other:') != -1) ? ' ' + data.jws.substr(data.jws.indexOf('other:')+6) : '';

        data.zhye = data.zhye * 1 > 0 ? data.zhye : 0;

        data['name'] = data.xm;
        data['avatar'] = data.hztx || (data.xb == '1' ? config.defaultAvatarMale : config.defaultAvatarFemale);
        data['sex'] = data.xb == '1' ? '男' : '女';
        data['age'] = new Date().getFullYear() - dateBirth.substr(0,4);
        data['zhzlrq'] = data.zhzlrq.substr(0,4) + '.' + data.zhzlrq.substr(4,2) + '.' + data.zhzlrq.substr(6, 2);
        data['jws'] = data.jws ? $.trim(data.jws.replace(/[a-zA-Z:,;{}]+/g, ' ')) : '';
        data['jws'] += temp;
        data['dateBirth'] = data.csrq ? (data.csrq.substr(0,4) + '.' + data.csrq.substr(4,2) + '.' + data.csrq.substr(6, 2)) : '';

        store.set('avatar', data['avatar']);
        return data;

    }

    function setQrcode() {
        http.post({
            url: qrcodeUrl,
            data: JSON.stringify({
                hzwxbm: hzwxbm
            }),
            success: function(res) {
                if ( res.status == '0') {
                    var data = res.data;
                    if (data) {
                        baseData['qrcode'] = data;
                        $('.qrcode').attr('src', data);
                    }
                }
            }
        });
    }

    $tabBtn.on('tap', function(e) {
        e.preventDefault();
        var that = $(this);
        var $tabBtnActive = $('.table-nav-item.active');

        $tabBtnActive.removeClass('active');
        that.addClass('active');
        if (that.hasClass('js-base')) {
            $tabContent.html(base_tpl(baseData));
            $('.js-addcharge').hide();
            // setQrcode();
        } else {
            setCharge();
            $('.js-addcharge').show();
        }
    });
    $(document).on("tap",".js-addcharge",function(){
    	if(hasShoufei){
    		return;
    	}
       window.location.href="/webapp/html/addcharge.html?hzId="+hzId;
    });

});
