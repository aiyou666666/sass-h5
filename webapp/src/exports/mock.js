
var mockjax = require('../libs/mockjax.js');

// 患者数量
$.mockjax({
  url: "/server/patient/findTodayCount",
  responseText: {
    status: 0,
    "desc": "成功",
    "data": {
		"monthCount": "132",
        "dqyy":"32",
        "jryy":"23",
        "bzyy":"123",
        "byyy":"1234"
    }
    }
});
/*登录接口*/
$.mockjax({
  url: "/server/login/userLogin",
  data:{
	   sj:"15293721827",
	   mm:"888888"
      },
	  responseText: {
		    "status": "状态值",
		    "desc": "描述",
		    "data": {
	        "token":"token",
		      "yhid":"用户id",
	        "mc":"机构名称",
          "ysmc":"医生名称",
          "jgtx":"机构头像"
      }
}
});

/*服务器配置*/
$.mockjax({
	url:"/server/public/time",
	responseText:{
      "status": "状态值",
      "desc": "描述",
      "data": {
	    "time":"1467194134327"
        }
    }
});

// 业务统计 和业务管理
$.mockjax({
  url: "/server/busi/findJgBusiByMonth",
  responseText: {
      "status": "0",
      "desc": "成功",
      "data": [
          {
              "ssje": "3.678.999",
              "yshj": "4.678.999",
              "yjj": "58.99",
              "sbk": "188.12",
              "qt": "5888.99",
              "yyl": "预约率",
              "czl": "出诊率",
              "hfl": "回访率",
              "doctor": [
                  {
                      "name": "张三",
                      "ss": "实收"
                  },
                  {
                      "name": "李四",
                      "ss": "实收"
                  }
              ],
              "chaegeItem": [
                  {
                      "item": "手术费",
                      "fyje": "1000"
                  },
                  {
                      "item": "放射费",
                      "fyje": "2081"
                  }
              ]
          }
      ]
  }
});

// 患者数量 %%  患者搜索
$.mockjax({
  url: "/server/patient/findPatientList",
  responseText: {
    "status": 0,
    "desc": "成功",
    "data": [
        {
            "hztx": "http://p3.music.126.net/cabZt9owLBjwQ-k5jOydlw==/6011030069087568.jpg",
            "sfhy": "0",
            "hzId": "e84ada09a1f14cfc8d299f9d9f7d5bf4",
            "xm": "张二狗",
            "id": "9571e75800184ff0b744f1434ff79a20",
            "szys": "59154ec16f5d4c63a769baafa6ee40d2",
            "zxsStr": "",
            "hzflStr": "",
            "zhzlrq": "20160628160235",
            "xb": "1",
            "sfxy": "0",
            "qfje": 20034,
            "mzblh": "20160628005",
            "yyysStr": "",
            "szrq": "100628160221",
            "zhye": 0,
            "sfyj": "0",
            "zhzlysStr": "李医生",
            "szysStr": "李医生",
            "hydjStr": "",
            "sfbr": "0",
            "zhzlys": "59154ec16f5d4c63a769baafa6ee40d2",
            "hzlyStr": "",
            "csrq": "20160628160221",
            "yl": 0,
            "hztx": ""
        },{
            "hztx": 'http://p3.music.126.net/cabZt9owLBjwQ-k5jOydlw==/6011030069087568.jpg?param=200y200',
            "sfhy": "0",
            "hzId": "e84ada09a1f14cfc8d299f9d9f7d5bf4",
            "xm": "李四",
            "id": "9571e75800184ff0b744f1434ff79a20",
            "szys": "59154ec16f5d4c63a769baafa6ee40d2",
            "zxsStr": "",
            "hzflStr": "",
            "zhzlrq": "20160628160235",
            "xb": "1",
            "sfxy": "0",
            "qfje": 20034,
            "mzblh": "20160628005",
            "yyysStr": "",
            "szrq": "20160628160221",
            "zhye": 0,
            "sfyj": "0",
            "zhzlysStr": "李医生",
            "szysStr": "李医生",
            "hydjStr": "",
            "sfbr": "0",
            "zhzlys": "59154ec16f5d4c63a769baafa6ee40d2",
            "hzlyStr": "",
            "csrq": "20160628160221",
            "yl": 0,
            "hztx": ""
        }
    ]
}
});
/*新增预约 更新预约*/
$.mockjax({
  url: "/server/patient/getDictionarys",
  responseText: {
     "status": 0,
     "desc": "成功",
     "data":
      [
         {
             "zdbm": "会员等级编码",
             "mc": "智障患者"
         },
         {
             "zdbm": "会员等级编码",
             "mc": "高级会员"
         }
     ]
    }
 });
$.mockjax({
	 url:"/server/appointWx/savePatientAppointWx",
	 responseText:{
    "status": 0,
    "desc": "成功",
    "data": {
        "id": "1963d4a49c3f4bfdb84eca1649fa6fe1",
        "hzId": "7d0c457dc46a454bb5541c6c9891c3d5"
    }
  }
});



// 患者分类
$.mockjax({
    url: "/server/patient/getDictionarys",
    responseText:{
     "status": 0,
     "desc": "成功",
     "data":
      [
         {
             "zdbm": "会员等级编码",
             "mc": "智障患者"
         },
         {
             "zdbm": "会员等级编码",
             "mc": "高级会员"
         }
     ]
    }
});



$.mockjax({
  url: "/server/patient/findPatientById",
  responseText: {
      "status": '0',
      "desc": "成功",
      "data": [
          {
              "hzid": "患者id",
              "mzblh": "门诊病历号",
              "hzxm": "患者姓名",
              "hzxb": "患者性别",
              "hzxbStr":"性别内容",
              "csrq": "出生日期",
              "nl":"年龄带单位",
              "sfzh": "身份证号",
              "gj": "国籍",
              "mz": "民族",
              "xx": "血型",
              "hzlxdh": "患者联系电话",
              "lxdz": "联系地址",
              "jws": "既往史",
              "qtjb": "其他疾病",
              "sfxy": "是否吸烟",
              "cyl": "抽烟量",
              "sfhy": "是否怀孕",
              "yl": "孕龄",
              "sfbr": "是否哺乳",
              "sfyj": "是否月经",
              "gms": "过敏史",
              "hykh": "会员卡号",
              "hydj": "会员等级",
              "hydjStr":"会员等级内容",
              "hzly": "患者来源",
              "hzfl": "患者分类",
              "szrq": "首诊日期",
              "szys": "首诊医生",
              "zhzlrq": "最后诊疗日期",
              "zhzlys": "最后诊疗医生",
              "jsr": "介绍人",
              "qfje": "欠费金额",
              "ysje": "已收金额",
              "zxs": "咨询师",
              "bz": "备注",
              "sfgzwxh": "是否关注微信号"
          }
      ]
   }
 });
// 患者分类
$.mockjax({
    url: "/server/patient/getDictionarys",
    responseText:{
        "status": 0,
        "desc": "成功",
        "data":
        [
            {
                "zdbm": "会员等级编码",
                "mc": "智障患者"
            },
            {
                "zdbm": "会员等级编码",
                "mc": "高级会员"
            }
        ]
    }
});



$.mockjax({
    url: "/server/wxcharge/findChargeListWxByHzId",
    responseText:{
        "status": 0,
        "desc": "成功",
        "data":[
        {
            "sfjlId": "03c1e9aa9f60492893478431e25dbb94",
            "sfztStr": "本次项目收费",
            "sfzt": "2",
            "ssje": 1,
            "hzId": "305fd96fa4a247de814954d4f0b92c43",
            "djh": 10000214,
            "sfsj": "20160530133446"
        },
        {
            "sfjlId": "03ce4b3a4dd74cc6864a809244b86207",
            "sfztStr": "本次项目收费",
            "sfzt": "2",
            "ssje": 1,
            "hzId": "305fd96fa4a247de814954d4f0b92c43",
            "djh": 10000229,
            "sfsj": "20160530145552"
        }
    ]
    }
});
/*患者端*/
/*我的诊所*/
$.mockjax({
	 url:"/server/patient/findOrganizationByOpenid",
	 responseText:{
    "status": 0,
    "desc": "成功",
    "data": [
        {
          "mc": "秀水街1号",
			    "dh":"15201398536",
			    "yyzz":"../images/patientClinicBg.jpg",
          "dz":"光华路soho2期A座",
          "gzsj": "123219387261"
        },
        {
          "mc": "秀水街2号",
			    "dh":"15201398536",
			    "yyzz":"../images/patientClinicBg.jpg",
          "dz":"光华路soho2期A座",
          "gzsj": "123219387261"
        }
    ]}
});
/*机构详情*/
$.mockjax({
	 url:"/server/organization/modifyOrganization",
	 responseText:{
				  "mc":"秀水街1号",
				  "dz":"光华路soho2期A座",
				  "ms":"描述描述描述描述描述描述描述描述描述描述描述描述描述",
				  "gzsj":"120392128321"
	 }
});

//预约详情
$.mockjax({
	url:"/server/appointWx/getAppoints",
	responseText:{
    "status": 0,
    "desc": "成功",
    "data": [
        {
            "patientId": "患者ID",
            "patientName": "1",
           "patientMobile": "18635905114",
            "patientGender": "1",
            "patientAge": 0,
            "birthDate": null,
           "doctorId": "8571b6ef795e453987d9b066f693513d",
            "doctorName": "",
            "apptTimeBegin": null,
            "apptTimeEnd": null,
            "items": [
                "2"
            ],
            "status": "0",
             "apptId": "03ea579b9a9b4b328d2d7a89b921eef0"
        }
    ]
  }
});
$.mockjax({
	  url:"/server/wxcharge/saveChagerWx",
	  responseText:{
    "status": 0,
    "desc": "成功",
    "data": [
        {
            "sfjlId": "收费记录ID",
            "fyzh": "费用总和",
            "yfje": "应付金额",
            "hzId":"患者ID"
        }
    ]
}
});
