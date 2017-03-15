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


## Update Log

### 2016.6.20

* `[+]` Add next post and previous post link in post page.


## License

[MIT License](https://github.com/jzyangbb/Chelper/blob/master/README.md)
