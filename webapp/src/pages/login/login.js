var $ = require("zepto");
var http = require("ajax");
var tip = require("kami/tip");
var loading = require("kami/loading");
var store = require("store");
var tpl = require("./login.hbs")
require("../../exports/common.js");

$(function() {
  
  isLogin(function() {
    init();
  });

});


function init() {
  store.remove("token");
  var $dom = $(tpl());
  var $contaniner = $("#container");
  $contaniner.append($dom);
  var $account = $(".js-account");
  var $password = $(".js-password");
  var $clearInput = $(".clearInput");

	$(document).on("click", ".js-login", function() {

		var accountVal = $account.val();
		var passwordVal = $password.val();
		if($.trim(accountVal) == '' || $.trim(accountVal) == undefined) {
			tip.show({
				 content: "账号不能为空",
			});
			return;
		}
		if($.trim(passwordVal) == '' || $.trim(passwordVal) == undefined) {
			tip.show({
				content: "密码不能为空"
			});
			return;
		}
		var _data = {
			"sj": $.trim(accountVal),
			"mm": $.trim(passwordVal)
		}
		http.post({
			url: "/server/login/userLogin",
			data: JSON.stringify(_data),
			contentType: "application/json",
			beforeSend: function() {
				loading.show();
			},
			success: function(res) {
				loading.hide();
				if(!res.data) {
					tip.show({
						content: res.desc,
					});
					return;
				}
				var _token = res.data.token;
				var _yhid = res.data.yhid; //用户id
				var _jgtx = res.data.jgtx; //机构头像
				var _ysmc = res.data.ysmc; //医生名称
				var _mc = res.data.mc; //机构名称
				store.set({
					token: _token,
					yhid: _yhid,
					yhid: _yhid,
					ysmc: _ysmc,
					mc: _mc,
					jgtx: _jgtx
				});
				window.location.href = "/webapp/html/index.html";
			},
			error: function(error) {
				loading.hide();
			}
		});

	});



	$(document).on("input", ".js-account", function() {
		$clearInput.show();
		if($(this).val() == '') $clearInput.hide();
	});
	$(document).on("input", ".js-password", function() {
		  $(this).val($(this).val().replace(/\s/g,''));
		
	});
  $(document).on("click", ".js-clearInput", function() {
		$clearInput.hide();
		$account.val("");
	});

}


function isLogin(cb) {
  var userInfo = store.get();
  if(userInfo.token) {
    $.ajax({
      url : "/server/login/checkToken",
      type  : "post",
      dataType : "json",
      contentType : "application/json",
      cache : false,
      data : JSON.stringify( {
        token : userInfo.token
      }),
      success : function(rs) {
        if (rs.status === -2 ) {
          cb && cb(); 
        } else if(rs.status === 0) {
          window.location.href = "/webapp/html/index.html";
        } else {
          cb && cb(); 
        }
      },
      error : function() {
        cb && cb();
      }
    });
    return true;
  }
  setTimeout(function() {
    cb && cb();
  });
}
