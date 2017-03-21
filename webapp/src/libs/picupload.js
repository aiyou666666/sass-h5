var tip=require("kami/tip");
var picupload = {
	setting: {},
	init: function(opt) {
		var scope = this;
		this.setting = opt;
		$(opt.doms).each(function(index, val) {
			$(document).on("change", "#" + val, function(e) {
				scope.readfile($(this)[0].files[0], val,opt.domain);
			});
		})
	},
	readfile: function(file, dom, uploadUrl) {
		var scope = this;
		if (!this.fileter(file, /image\/\w+/)) {
			tip.show({
				content:"只能选择图片格式"
			});
			return false;
		};

		var reader = new FileReader();
		reader.readAsDataURL(file);
		reader.onload = function(e) {
			$(".testfile").attr("src", this.result);
			scope.uploadfile(file, dom, uploadUrl);
		};
	},
	fileter: function(file, patten) {
		if (!patten.test(file.type)) {
			return false;
		}
		return true;

	},
	uploadfile: function(file, dom, uploadUrl) {
		var formdata = new FormData();
		var scope = this;
		formdata.append("file", file);
		formdata.append("name", file.name);
		formdata.append("key", this.creatKey(file.name));
		var xhr = new XMLHttpRequest();
		xhr.open("POST", uploadUrl || "http://upload.qiniu.com", true);
		console.log(uploadUrl);
		xhr.onload = function(res) {
			if (xhr.status == 200) {
				console.log(res);
				resData = JSON.parse(res.currentTarget.responseText);
				var ImgUrl = resData.data.pre + resData.data.hztx;
				var imgPath = resData.data.hztx;
                scope.setting.end(ImgUrl, imgPath, scope.setting.domain, dom);
		
			} else {
				console.log("上传失败");
			}
		};
		xhr.send(formdata);
	},
	creatKey: function(fileName) {
		return (+new Date()) + (/\.[^\.]+/.exec(fileName));
	}
}
module.exports = picupload;
