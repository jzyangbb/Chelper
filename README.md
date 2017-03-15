# About this document

## 第一步：引入jQuery库

    > <script type="text/javascript" src="<%=path%>/resources/js/chelper.js"></script>

## 最常用之分页
使用场景是 先显示页面后加载局部分页
``` java
//DAL
		var listQuery = new Chelper.PageBarAddtion({
			id : "saleshipmentListTable",
			url : Chelper.path + "/warehouse/saleshipment/listData.shtml",
			renderId : "saleshipmentListTable_body",
			pageBarId : "saleshipmentListTable_bar",                   //分页div
			pageHiddenName : "saleshipmentListTable_pagebar_hidden",   //分页参数
			loading : true,
		});
		listQuery.send();
```

## 最常用之查询
使用场景如 进入详情页面
``` java
$("#addBtn").on("click",function(){
			var remote = $(this).attr("data-href");
			var query = new Chelper.RemoteQuery({
				renderId:"main-page-content",
				url:remote
			});
			query.send();
		});
```
## 最常用之提交
使用场景如 一个表单提交
``` java
var submitRemote = new Chelper.RemoteTrans({
		url : Chelper.path + "/warehouse/saleorder/saveDetail.shtml",
		onSuccess : function(jsonData){
			//var jsonData = $.parseJSON(data);
			if(jsonData.success){
				listDetailQuery.send();
			}
			Chelper.fun.message(jsonData.message);
		},onError : function(jsondata){
			if (jsondata.message) {
				Chelper.fun.message(jsondata.message);
			}
		}
	});
```
## 最常用之弹出层

``` java
var remote = $(this).attr("data-href"); 
new Chelper.Modal({
	remote : remote,
});
```
## 最常用之其他
Chelper.fun.isNotNull
Chelper.fun.confirm
Chelper.fun.message


## Update Log

### 2016.6.20

* `[+]` Add next post and previous post link in post page.


## License

[MIT License](https://github.com/jzyangbb/Chelper/blob/master/README.md)
