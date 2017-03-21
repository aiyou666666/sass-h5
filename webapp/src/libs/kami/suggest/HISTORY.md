# 历史记录

---


## 0.0.1
first commit

## 0.0.2
新增了onSearchKeyup(e, inputVal)事件，现在在手机上键盘的回车键会显示成搜索按键了

## 1.0.0

发布稳定版本

## 1.0.1

`add` enableNoDataTpl 允许用户使用nodataTpl,默认为false
`add` nodataTpl 提供渲染数据为空时的模板
`fixed` async为false 时，不能直接filterData

## 1.0.2

修复组件中input的id固定，导致页面中引用多个suggest时id重复的bug。