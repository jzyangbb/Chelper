if (typeof (Chelper) === "undefined" || !Chelper) {
	var Chelper = {
		version : "1.0",
		path : ""
	};
	var scripts = document.getElementsByTagName("script");
	var host = window.location.host;
	for ( var i = 0; i < scripts.length; i++) {
		var src = scripts[i].src;
		if (src.indexOf("chelper.js") > -1) {
			src = src.substring(src.indexOf(host));
			src = src.substring(src.indexOf("/"), src.indexOf("/js"));
			src = src.replace("/static", "");
			Chelper.path = src;
			break;
		}
	}
}
Array.prototype.contains = function(oObj) {
	var _THIS = this;
	for ( var i = 0; i < _THIS.length; i += 1) {
		if (_THIS[i] === oObj) {
			return true;
		}
	}
	return false;
};
Array.prototype.remove = function(index) {
	if (isNaN(index) || index > this.length) {
		return false;
	}
	return this.splice(index, 1);
};
Array.prototype.containCount = function(oObj) {
	var _THIS = this;
	var count = 0;
	for ( var i = 0; i < _THIS.length; i += 1) {
		if (_THIS[i] === oObj) {
			count += 1;
		}
	}
	return count;
};
Array.prototype.copy = function() {
	var arrs = [];
	for ( var i = 0; i < this.length; i += 1) {
		arrs.push(this[i]);
	}
	return arrs;
};

String.prototype.trim = function() {
	return this.replace(/(^\s*)|(\s*$)/g, "");
};
String.prototype.len = function() {
	return this.replace(/[^x00-xff]/g, "aa").length;
};
String.prototype.format = function(args) {
	var result = this;
	if (arguments.length > 0) {
		if (arguments.length == 1 && typeof (args) == "object") {
			for ( var key in args) {
				if (args[key] != undefined) {
					var reg = new RegExp("({" + key + "})", "g");
					result = result.replace(reg, args[key]);
				}
			}
		} else {
			for ( var i = 0; i < arguments.length; i++) {
				if (arguments[i] != undefined) {
					var reg = new RegExp("({[" + i + "]})", "g");
					result = result.replace(reg, arguments[i]);
				}
			}
		}
	}
	return result;
};

Chelper.inherits = function(fSubclass, fSuperclass) {
	var F = function() {
	};
	F.prototype = fSuperclass.prototype;
	fSubclass.prototype = new F();
	fSubclass.prototype.constructor = fSuperclass;
	fSubclass.prototype.selfConstructor = fSubclass;
};

Chelper.Index = function() {
	var index = 1000;
	this.getIndex = function() {
		return index += 1;
	};
};

Chelper.Map = function() {
	this.obj = {};
	this.prefix = "mapkey_prefix_";
	this.length = 0;
};
Chelper.Map.prototype.put = function(key, value) {
	if (!this.hasKey(key)) {
		this.length += 1;
	}
	this.obj[this.prefix + key] = value;
};
Chelper.Map.prototype.get = function(key) {
	return this.obj[this.prefix + key];
};
Chelper.Map.prototype.remove = function(key) {
	if (this.hasKey(key)) {
		var _oValue = this.get(key);
		delete this.obj[this.prefix + key];
		this.length -= 1;
		return _oValue;
	}
};
Chelper.Map.prototype.clear = function() {
	for ( var fo in this.obj) {
		if (this.obj.hasOwnProperty(fo)) {
			delete this.obj[fo];
		}
	}
	this.length = 0;
};
Chelper.Map.prototype.hasKey = function(key) {
	var flag = this.obj.hasOwnProperty(this.prefix + key);
	return flag;
};
Chelper.Map.prototype.size = function() {
	return this.length;
};
Chelper.Map.prototype.values = function() {
	var _aArrays = [];
	for ( var fo in this.obj) {
		if (this.obj.hasOwnProperty(fo)
				&& fo.substring(0, this.prefix.length).toLowerCase() === this.prefix) {
			_aArrays.push(this.obj[fo]);
		}
	}
	return _aArrays;
};
Chelper.Map.prototype.keys = function() {
	var _aArrays = [];
	for ( var fo in this.obj) {
		if (this.obj.hasOwnProperty(fo)
				&& fo.substring(0, this.prefix.length).toLowerCase() === this.prefix) {
			_aArrays.push(fo.substr(this.prefix.length));
		}
	}
	return _aArrays;
};

Chelper.BaseCache = function(p) {
	p = p || {};
	this.maxCacheTimeMM = p.maxCacheTimeMM || -1;// 页面缓存最大毫秒数,小于0则缓存永运不过期
	this.cacheMap = new Chelper.Map();
};
Chelper.BaseCache.prototype.addCache = function(key, data) {
	var obj = {
		value : data
	};
	if (this.maxCacheTimeMM > 0) {
		obj.timeMM = new Date().getTime();
	}
	this.cacheMap.put(key, obj);
};
Chelper.BaseCache.prototype.removeCache = function(key) {
	this.cacheMap.remove(key);
};
Chelper.BaseCache.prototype.clearCache = function() {
	this.cacheMap.clear();
};
Chelper.BaseCache.prototype.getCache = function(key) {
	var data = this.cacheMap.get(key);
	if (!data)
		return undefined;
	if (this.maxCacheTimeMM <= 0) {
		return data.value;
	} else {
		if (new Date().getTime() <= (data.timeMM + this.maxCacheTimeMM)) {
			return data.value;
		} else {
			this.removeCache(key);
			return undefined;
		}
	}
};

Chelper.componentId = new Chelper.Index();
Chelper.Components = function(p) {
	this.id = p.id
			|| ("Chelper_componentId_" + Chelper.componentId.getIndex() + "_" + new Date()
					.getMilliseconds());
	Chelper.setComponent(this.id, this);
	this.getId = function() {
		return this.id;
	};
};
Chelper.component = new Chelper.Map();
Chelper.getComponent = function(id) {
	return Chelper.component.get(id);
};
Chelper.setComponent = function(id, object) {
	return Chelper.component.put(id, object);
};

Chelper.BaseRemote = function(p) {
	p = p || {};
	Chelper.Components.call(this, p);
	this.url = p.url;
	this.params = p.params || {};// 请求参数json格式{param1:1,param2:2}
	this.method = p.method || "post";// 请求方法
	this.isAsync = p.isAsync === undefined ? true : p.isAsync;// 请求方式，默认为异步请求
	// 回调函数
	this.onSuccess = p.onSuccess;// 请求成功后回调方法
	this.onError = p.onError;// 请求失败回调方法
	this.onSystemError = p.onSystemError;// 发生系统异常时回调方法,如服务器异常
	this.onComplete = p.onComplete;// 请求完成回调方法
	this.onTimeout = p.onTimeout;// 请求参数回调
	this.timeoutMilli = p.timeoutMilli || 60000;// 请求超时毫秒数
	this.onLogin = p.onLogin;// 请求需要登陆时回调
	this.maxCacheTimeMM = p.maxCacheTimeMM || -1;// 最大缓存毫秒数,默认不缓存
	this.__baseCache = new Chelper.BaseCache({
		"maxCacheTimeMM" : this.maxCacheTimeMM
	});
	// 内部属性
	this.requestVersion = 0;
};
Chelper.BaseRemote.prototype.addParameters = function(key, value) {
	if (Chelper.fun.isNotNull(key)) {
		this.params[key] = value;
	}
};
Chelper.BaseRemote.prototype.addP = function(key, value) {
	this.addParameters(key, value);
};
Chelper.BaseRemote.prototype.removeParameters = function(key) {
	if (Chelper.fun.isNotNull(key)) {
		delete this.params[key];
	}
};
Chelper.BaseRemote.prototype.getParameters = function(key) {
	if (Chelper.fun.isNotNull(key)) {
		return this.params[key];
	}
	return undefined;
};
Chelper.BaseRemote.prototype.send = function(isRefreshLoad) { 
	var THIS = this;
	isRefreshLoad = isRefreshLoad === undefined ? false : isRefreshLoad;
	THIS.requestVersion += 1;
	if (THIS.maxCacheTimeMM > 0 && !isRefreshLoad) {
		var _paramsStr = THIS.getParamsStr();
		var _key = THIS.url.split("?")[0] + ":" + _paramsStr;
		if (_key) {
			var data = THIS.__baseCache.getCache(_key);
			if (data != undefined) {
				if (typeof (THIS.success) === 'function') {
					THIS.success(data);
				}
				return;
			}
		}
	}
	var _sRequestKey = null;
	if (THIS.maxCacheTimeMM > 0) {
		var _paramsStr = this.getParamsStr();
		_sRequestKey = THIS.url.split("?")[0] + ":" + _paramsStr;
	} 
	-function(version, _sRequestKey) {
		$.ajax({
			type : THIS.method,
			url : THIS.url.split("?")[0],
			data : THIS.getParams(),
			dataType : "html",
			timeout : THIS.timeoutMilli,
			contentType : "application/x-www-form-urlencoded; charset=utf-8",
			async : THIS.isAsync,
			success : function(data, status, XMLHttpRequest) { 
				if (version !== THIS.requestVersion) {
					return;
				}
				if (XMLHttpRequest.getResponseHeader("xmlHttpRequestError")) {
					THIS.error($.parseJSON(data), status);
					return;
				}
				if (XMLHttpRequest.getResponseHeader("sessionstatus")) {
					if (typeof (THIS.login) === 'function') {
						THIS.login();
					}
					return;
				}
				if (THIS.maxCacheTimeMM > 0 && _sRequestKey) {
					THIS.__baseCache.addCache(_sRequestKey, data);
				}
				THIS.success(data, status);
			},
			error : function(xMLHttpRequest, textStatus, errorThrown) { 
				if (textStatus === "timeout") {
					THIS.timeout();
				} else {
					if (typeof (THIS.onSystemError) === "function") {
						THIS.onSystemError();
					}else{
						Chelper.fun.message("系统未知异常");
					}
				}
			},
			complete : function() { 
				THIS.complete();
			}
		}); 
	}(THIS.requestVersion, _sRequestKey);
};
Chelper.BaseRemote.prototype.complete = function() {
	if (typeof (this.onComplete) === 'function') {
		this.onComplete();
	}
};
Chelper.BaseRemote.prototype.success = function(data, status) {
	if (typeof (this.onSuccess) === 'function') {
		this.onSuccess(data, status);
	}
};
Chelper.BaseRemote.prototype.error = function(jsondata, status) {
	if (typeof (this.onError) === 'function') {
		this.onError(jsondata, status);
	} else {
		if (jsondata.message) {
			Chelper.fun.message(jsondata.message);
		}
	}
};

Chelper.BaseRemote.prototype.timeout = function() {
	if (typeof (this.onTimeout) === 'function') {
		this.onTimeout();
	}
};
Chelper.BaseRemote.prototype.getParams = function() {
	var _content = {};
	var prop;
	for ( var element_client in this.params) {
		prop = this.params[element_client];
		if (prop !== undefined && prop !== null && typeof prop != "function") {
			_content[element_client] = prop;
		}
	}
	if (this.url) {
		var m = this.url.split("?");
		if (m[1]) {
			var t = m[1].split("&");
			for ( var i = 0; i < t.length; i++) {
				var subt = t[i].split("=");
				if (subt[1]) {
					_content[subt[0]] = subt[1];
				}
			}
		}
	}
	return _content;
};
Chelper.BaseRemote.prototype.login = function() {
	if (typeof (this.onLogin) === "function") {
		this.onLogin();
	} else {
		location.href = Chelper.path + '/login.jsp';
	}
};
Chelper.BaseRemote.prototype.getParamsStr = function() {
	var _paramsObj = this.getParams();
	var _content = "";
	var prop;
	for ( var name in _paramsObj) {
		prop = _paramsObj[name];
		if (prop) {
			if (_content !== "") {
				_content = _content + ",";
			}
			if (typeof prop == "number" || typeof prop == "string") {
				_content = _content + name + ":" + prop;
			} else if (typeof prop == "object" && prop.constructor === Array
					&& prop.length > 0) {
				var _aParam = prop;
				_content = _content + name + ":[";
				for ( var i = 0; i < _aParam.length; i += 1) {
					if (i !== 0) {
						_content = _content + ",";
					}
					_content = _content + _aParam[i];
				}
				_content = _content + "]";
			}
		}
	}
	return _content;
};

// RemoteTrans
Chelper.RemoteTrans = function(p) {
	p = p || {};
	Chelper.BaseRemote.call(this, p);
	this.loading = p.loading === undefined ? false : p.loading;
	this.successRediectUrl = p.successRediectUrl || null;
	this.isRepeat = p.isRepeat === undefined ? true : p.isRepeat;
	this.loadingText = "<div class='page-loading'><img src='"
			+ Chelper.path
			+ "/static/aceadmin/assets/img/loading.gif'>&nbsp;&nbsp;<span>加载中...</span></div>";
	this.sending = false;// 避免用户快速点击多次，向服务器发送多次重复的请求
	this.isAlreadyTrans = false;// 是否已经成功交易过一次，防止表单重复提交
};
Chelper.inherits(Chelper.RemoteTrans, Chelper.BaseRemote);
Chelper.RemoteTrans.prototype.reset = function() {
	this.params = {};
};
Chelper.RemoteTrans.prototype.send = function() {
	if (this.sending || (!this.isRepeat && this.isAlreadyTrans)) {
		if (!this.isRepeat && this.isAlreadyTrans) {
			Chelper.fun.message("为了防止重复提交，刷新页面后重试");
		}
		return;
	}
	this.sending = true;
	if (this.loading) {
		$('.page-loading').remove();
		$(document.body).append(this.loadingText);
	}
	Chelper.RemoteTrans.prototype.constructor.prototype.send.call(this);
};
Chelper.RemoteTrans.prototype.success = function(data, status) {
	var jsonData = $.parseJSON(data); 
	if (jsonData.isSuccess === undefined || jsonData.isSuccess) {
		this.isAlreadyTrans = true;
		if (this.successRediectUrl) {
			location.href = this.successRediectUrl;
			return;
		} else if (this.onSuccess && typeof (this.onSuccess) === 'function') {
			this.onSuccess(jsonData, status);
		}
	} else {
		this.error(jsonData, status);
	}
};
Chelper.RemoteTrans.prototype.complete = function() {
	if (this.loading) {
		$('.page-loading').remove();
	}
	if (typeof (this.onComplete) === 'function') {
		this.onComplete();
	}
	this.sending = false;
};

Chelper.RemoteQuery = function(p) {
	p = p || {};
	Chelper.BaseRemote.call(this, p);
	this.renderId = p.renderId;
	this.isAppend = p.isAppend === undefined ? false : p.isAppend; // 是否追加在rederId
	this.loadingText = "<div class='page-loading'><img src='"
			+ Chelper.path
			+ "/static/aceadmin/assets/img/loading.gif'>&nbsp;&nbsp;<span>加载中...</span></div>";
	this.loading = p.loading === undefined ? false : p.loading;
	this.lastLoadData = null;
	this.onSystemError = function() {
		$("#" + this.renderId).html(this.lastLoadData);
		Chelper.fun.message("系统繁忙,请重新刷新页面!");
	};
};
Chelper.inherits(Chelper.RemoteQuery, Chelper.BaseRemote);
Chelper.RemoteQuery.prototype.success = function(data, status) {
	if (this.renderId) {
		if (this.isAppend) {
			if($("#" + this.renderId).children().size() > 0) {
				$("#" + this.renderId).children(":last").after(data);
			} else {
				$("#" + this.renderId).html(data);
			}
		} else {
			$("#" + this.renderId).html(data);
		}
	}
	if (typeof (this.onSuccess) === 'function') {
		this.onSuccess(data, status);
	}
};
Chelper.RemoteQuery.prototype.send = function() {
	if (this.loading && this.renderId) {
		this.lastLoadData = $("#" + this.renderId).html();
		$("#" + this.renderId).html(this.loadingText);//TODO
		$('.page-loading').remove();
		$(document.body).append(this.loadingText);
	}
	Chelper.RemoteQuery.prototype.constructor.prototype.send.call(this);
};
Chelper.RemoteQuery.prototype.complete = function() {
	if (this.loading) {
		$('.page-loading').remove();
	}
	if (typeof (this.onComplete) === 'function') {
		this.onComplete();
	}
};

// PageBarAddtion
Chelper.PageBarAddtion = function(p) {
	p = p || {};
	Chelper.RemoteQuery.call(this, p);
	this.pageBarId = p.pageBarId || "pagebar_div"; // 分页工具条所在DIV
	this.pageSize = p.pageSize || 10; // 页大小(默认10页)
	this.pageList = p.pageList || [ 10,20,50,100],
	this.showPageList = p.showPageList === undefined ? true : p.showPageList;
	this.currentPage = 1; // 当前页
	this.pageHiddenName = p.pageHiddenName || "pagebar_hidden";
	this.totalSize = 0; // 总共记录数
	this.totalPageSize = 0; // 总共页大小
	this.callback = p.callback;
	var THIS = this;
	this.jump = function(num) {
		THIS.currentPage = num;
		this.addParameters("currentPage", this.currentPage);
		this.addParameters("pageSize", this.pageSize);
		Chelper.PageBarAddtion.prototype.constructor.prototype.send.call(this);
	};
	this.pre = function() {
		var _nCurrent = THIS.currentPage - 1;
		if (_nCurrent <= 1) {
			_nCurrent = 1;
		}
		if (_nCurrent > THIS.totalPageSize) {
			_nCurrent = THIS.totalPageSize;
		}
		if (_nCurrent === THIS.currentPage) {
			return;
		}
		THIS.jump(_nCurrent);
	};
	this.next = function() {
		var _nCurrent = THIS.currentPage + 1;
		if (_nCurrent <= 1) {
			_nCurrent = 1;
		}
		if (_nCurrent > THIS.totalPageSize) {
			_nCurrent = THIS.totalPageSize;
		}
		if (_nCurrent === THIS.currentPage) {
			return;
		}
		THIS.jump(_nCurrent);
	};
	this.first = function() {
		THIS.jump(1);
	};
	this.last = function() {
		THIS.jump(THIS.totalPageSize);
	};
};
Chelper.inherits(Chelper.PageBarAddtion, Chelper.RemoteQuery);

Chelper.PageBarAddtion.prototype.init = function(beginPageBarNum, endPageBarNum, totalPageRows, totalCount) {
	var THIS = this;
	
	var startDataSize = 0;
	var endDataSize = 0;
	var isHaveData = totalPageRows > 0 && totalCount > 0;
	if (isHaveData) {
		startDataSize = THIS.currentPage == 1 ? 1 : (THIS.currentPage - 1) * THIS.pageSize;
		endDataSize = THIS.currentPage == totalPageRows ? ((THIS.currentPage - 1) * THIS.pageSize) + (totalCount % THIS.pageSize) : THIS.currentPage * THIS.pageSize;
	}
	
	var _left = '<div class="col-sm-2"><div class="dataTables_info" id="datalist_info" role="status" aria-live="polite">';
	if(THIS.showPageList) {
		_left = '<div class="col-sm-6"><div class="dataTables_info" id="datalist_info" role="status" aria-live="polite">';
		var _pageList = '<label>每页显示 <select id="pageSize">';
		for(var i = 0; i < THIS.pageList.length; i++) {
			var _pageSize = THIS.pageList[i];
			if(THIS.pageSize == _pageSize) {
			   _pageList +=  '<option selected="selected" value="' + _pageSize + '">' +  _pageSize + '</option>';
			} else {
			   _pageList +=  '<option value="' + _pageSize + '">' +  _pageSize + '</option>';
			}   
	    }
	    _pageList += '</select> 项结果，</label>';
		_left += _pageList + '本页显示第' + startDataSize + ' 至 ' + endDataSize + ' 项结果，共 ' + totalCount + '项';
		
	}
	_left += '</div></div>';

	
	var firstPage='<li class="first"><a href="javascript:void(0);" name="pagebar_first"><i class="glyphicon glyphicon-step-backward"></i></a></li>';
	var lastPage='<li class="last"><a href="javascript:void(0);" name="pagebar_last"><i class="glyphicon glyphicon-step-forward"></i></a></li>';
	var right = '<div class="col-sm-10"><div class="dataTables_paginate paging_bootstrap" id="datalist_paginate"><ul class="pagination">';
	if(THIS.showPageList) {
		right = '<div class="col-sm-6"><div class="dataTables_paginate paging_bootstrap" id="datalist_paginate"><ul class="pagination">';
	} 
	if (THIS.currentPage == 1 || !isHaveData) {
		firstPage='<li class="first  disabled"><a href="javascript:void(0);" ><i class="glyphicon glyphicon-step-backward"></i></a></li>';
		right+=firstPage;
		right += '<li class="prev disabled"><a href="javascript:void(0);"><i class="fa fa-angle-double-left"></i></a></li>';
	} else {
		right+=firstPage;
		right += '<li class="prev"><a href="javascript:void(0);" name="pagebar_pre"><i class="fa fa-angle-double-left"></i></a></li>';
	}
	if (isHaveData) {
		for ( var i = beginPageBarNum; i <= endPageBarNum; i += 1) {
			if (THIS.currentPage === i) {
				right += '<li class="active"><a href="javascript:void(0);">' + i + '</a></li>';
			} else {
				right += '<li><a href="javascript:void(0);" name="pagebar_number">' + i + '</a></li>';
			}
		}
	}
	if (THIS.currentPage == totalPageRows || !isHaveData) {
		right += '<li class="next disabled"><a href="javascript:void(0);"><i class="fa fa-angle-double-right"></i></a></li>';
		right+='<li class="last disabled"><a href="javascript:void(0);"><i class="glyphicon glyphicon-step-forward"></i></a></li>';
	} else {
		right += '<li class="next"><a href="javascript:void(0);" name="pagebar_next"><i class="fa fa-angle-double-right"></i></a></li>';
		right+=lastPage;
		//right += '<li><input type="text" placeholder="页码" style="height:32px;" name="pageGoto" size="2" /><a href="javascript:void(0);" name="pagebar_goto"><i class="fa fa-arrow-circle-right"></i></a></li>';
		right += '<li><input type="number" placeholder="页码" style="height:32px;width:50px;text-align:center;float:left" name="pageGoto" size="2" /></li>';
		right += '<li style=\"cursor:pointer;\"><a href="javascript:void(0);" name="pagebar_goto" class=\"btn btn-mini btn-success\">跳转</a></li>';
	}
	
	right += '</ul></div></div>';

	$("#" + this.pageBarId).html(_left + right );
	$("#" + THIS.pageBarId + ">div>div>ul>li>a[name='pagebar_pre']").click(THIS.pre);
	$("#" + THIS.pageBarId + ">div>div>ul>li>a[name='pagebar_next']").click(THIS.next);
	$("#" + THIS.pageBarId + ">div>div>ul>li>a[name='pagebar_first']").click(THIS.first);
	$("#" + THIS.pageBarId + ">div>div>ul>li>a[name='pagebar_last']").click(THIS.last);
	$("#" + THIS.pageBarId + ">div>div>ul>li>a[name='pagebar_goto']").click(function() {
		var gotoSize = $("#" + THIS.pageBarId + ">div>div>ul>li>input[name='pageGoto']").val();
		if (gotoSize!=null && gotoSize!="")
	    {
			if(!isNaN(gotoSize)){
				THIS.jump(parseInt(gotoSize));
			}
	    }
	});
	$("#" + THIS.pageBarId + ">div>div>ul>li>a[name='pagebar_number']").click(function() {
		THIS.jump(parseInt($(this).text()));
	});
	$("#" + THIS.pageBarId + ">div>div>label>select").change(function() {
		THIS.pageSize = parseInt($(this).val());
		THIS.jump(1);
	});
};
Chelper.PageBarAddtion.prototype.success = function(data, status) {
	$("#" + this.renderId).find("#loading").remove();
	Chelper.PageBarAddtion.prototype.constructor.prototype.success.call(this, data, status);
	if($("#" + this.pageHiddenName).length ){//test if exists.
		var datas = $("#" + this.pageHiddenName).val().split(",");
		var beginPageBarNum = Chelper.fun.parseInt(datas[0]);
		var endPageBarNum = Chelper.fun.parseInt(datas[1]);
		var totalPageRows = Chelper.fun.parseInt(datas[2]);
		var totalCount = Chelper.fun.parseInt(datas[3]);
		this.totalPageSize = totalPageRows;
		this.init(beginPageBarNum, endPageBarNum, totalPageRows, totalCount);
	}
	if (this.callback && typeof (this.callback) === 'function') {
		this.callback();
	}
};
Chelper.PageBarAddtion.prototype.send = function() {
	this.jump(1);
};
Chelper.PageBarAddtion.prototype.reload = function() {
	this.send();
};

Chelper.Form = function(p) {
	Chelper.RemoteTrans.call(this, p);
	this.formId = p.formId; //表单ID
	this.onSubmit = p.onSubmit;
	var THIS = this;
	$(document).ajaxComplete(function(event,request, settings){ 
		setTimeout(function(){$("button:submit").prop("disabled",false);},5000);
	}); 
	$("#" + THIS.formId).validate({
		submitHandler : function(element) {
			$("button:submit").prop("disabled",true);
			if (THIS.onSubmit && typeof (THIS.onSubmit) === 'function') {
				THIS.onSubmit(element);
			} else {
				var _array = $("#" + THIS.formId).serializeArray();
				var params = {};
				for ( var i = 0; i < _array.length; i += 1) {
					params[_array[i].name] = _array[i].value;
				}
				
				THIS.params = params;
				THIS.url = $("#" + THIS.formId).attr("action");
				THIS.send();
			}
			return false;
		}
	});
};
Chelper.inherits(Chelper.Form, Chelper.RemoteTrans);
Chelper.Form.prototype.success = function(data, status) { 
	var jsonData = $.parseJSON(data); 
	if (jsonData.isSuccess === undefined || jsonData.isSuccess) {
		if (this.onSuccess && typeof (this.onSuccess) === 'function') {
			this.onSuccess(jsonData, status);
		} else {
			Chelper.fun.message('操作成功。');
		}
	} else {
		this.error(jsonData, status);
	}
};
Chelper.Form.prototype.submit = function(){
	$("#" + this.formId).submit();
};

// Modal
Chelper.Modal = function(p) {
	Chelper.Components.call(this, p);
	this.remote = p.remote;
	this.backdrop = p.backdrop === undefined ? true : p.backdrop;
	this.keyboard = p.keyboard === undefined ? true : p.keyboard;
	this.show = p.show === undefined ? true : p.show;
	this.onLoaded = p.onLoaded;
	this.onHidden = p.onHidden;
	this.modalId = "commomModal_div";
	var THIS = this;
	if(typeof(Chelper.Modal.initialized) == "undefined") {
		var modelStr = "<div aria-hidden='true' role='dialog' tabindex='-1' id='" + THIS.modalId + "' class='modal fade mymodal' style='display:none;'><div class='modal-dialog modal-adjust'><div id='modal-content' class='modal-content'><div class='modal-body'></div></div></div></div>";
		$(document.body).append(modelStr);
		Chelper.Modal.initialized = true;
	}
	$("#" + THIS.modalId).modal({
		backdrop : THIS.backdrop,
		keyboard : THIS.keyboard,
		show : THIS.show,
		remote : THIS.remote
	});
	THIS.loading();
	$("#" + THIS.modalId).on("hidden.bs.modal", function(e) {
		$(this).removeData("bs.modal");
		$(this).find('.modal-content .modal-body').empty();
	});
	$("#" + THIS.modalId).on("loaded.bs.modal", function(e) {
		THIS.unloading();
		if (typeof (THIS.onLoaded) === 'function') {
			THIS.onLoaded();
		}
	});
	$("#" + THIS.modalId).on("hidden.bs.modal", function(e) {
		if (typeof (THIS.onHidden) === 'function') {
			THIS.onHidden();
		}
	});
};
Chelper.Modal.prototype.loading = function() {
	this.unloading();
	var loadingText = "<div class='page-loading'><img src='" + Chelper.path + "/static/aceadmin/assets/img/loading.gif'>&nbsp;&nbsp;<span>加载中...</span></div>";
	$("#" + this.modalId).append(loadingText);
};
Chelper.Modal.prototype.unloading = function() {
	$("#" + this.modalId).find(".page-loading").remove();
};
Chelper.Modal.prototype.close = function() {
	$("#" + this.modalId).modal("hide");
};
// main
Chelper.main = Chelper.main ? Chelper.main : {};
Chelper.main.load = function(remote, callFun){
	var query = new Chelper.RemoteQuery({
		renderId : "main-page-content",
		url : remote,
		onComplete : function(){
			if (typeof (callFun) === "function") {
				callFun();
			}
		}
	});
	query.send();
};

// fun
Chelper.fun = Chelper.fun ? Chelper.fun : {};

Chelper.fun.getFenMoney = function(money) {
	if(/^-?(?:\d+|\d{1,3}(?:,\d{3})+)?(?:\.\d+)?$/.test(money)) {
		money = (money * 1).toFixed(2);
		var moneyString = money.toString();
		if(moneyString.indexOf(".") > -1) {
		   var splitMoney = moneyString.split(".");
		   var yuan = splitMoney[0];
		   var jiao = splitMoney[1].charAt(0);
		   var fen = splitMoney[1].length == 2 ? splitMoney[1].charAt(1) : 0;
		   return yuan * 100 + jiao * 10 + fen * 1; 
		} 
		return money * 100;
	}
	return 0;
};

// alert
Chelper.fun.message = function(content, callback) {
	var tips = $('<div id="top-alert" class="top-alert-tips alert-success" style="display:block;">'
             +     '<a class="close" href="javascript:;"><b class="icon-remove-sign"></b></a>'
			 +     '<div class="alert-content">' + content + '</div>'
			 + '</div>');
	$(document.body).append(tips);
	tips.animate({
	   top : "0px"
    }, 500, function(){
    	setTimeout(function(){
    		tips.remove();
    		if (callback && typeof (callback) == "function") {
    			callback();
    		}
    	}, 3000);
    });
};
Chelper.fun.confirm = function(content, confirmFun, cancelFun) {
	var modalId = new Chelper.Index().getIndex();
	var modal = $('<div id="' + modalId + '" class="modal fade" aria-hidden="false" role="dialog" tabindex="-1" style="display: none;">'
			  +   '<div class="modal-dialog">'
			  +      '<div class="modal-content">'
			  +        '<div class="modal-header">'
			  +          '<button class="close" type="button"><span aria-hidden="true">×</span></button>'
			  +          '<h4 class="modal-title"><span class="glyphicon glyphicon-question-sign"></span> 提示信息</h4>'
			  +        '</div>'
			  +        '<div class="modal-body">'
			  +          content
			  +        '</div>'
			  +        '<div class="modal-footer">'
			  +          '<button data-bb-handler="cancel"  type="button" class="btn btn-default">取消</button>'
			  +          '<button data-bb-handler="confirm" type="button" class="btn btn-primary">确认</button>'
			  +        '</div>' 
			  +     '</div>' 
			  +   '</div>' 
			  + '</div>');
	$(document.body).append(modal);
	modal.modal();
	modal.find(".close").click(function() {
		modal.modal("hide");
	});
	modal.find(".btn-default").click(function() {
		modal.modal("hide");
		if (typeof (cancelFun) == "function") {
			cancelFun();
		}
	});
	modal.find(".btn-primary").click(function() {
		modal.modal("hide");
		if (typeof (confirmFun) == "function") {
			confirmFun();
		}
	});
	modal.on('hidden.bs.modal', function(e) {
		modal.remove();
	});
};

Chelper.fun.confirmReason = function(content, confirmFun, cancelFun) {
	var data = typeof(content)=='object' ? content : {};
	var modalId = new Chelper.Index().getIndex();
	var modal = $('<div id="' + modalId + '" class="modal fade" aria-hidden="false" role="dialog" tabindex="-1" style="display: none;">'
			  +   '<div class="modal-dialog">'
			  +      '<div class="modal-content">'
			  +        '<div class="modal-header">'
			  +          '<button class="close" type="button"><span aria-hidden="true">×</span></button>'
			  +          '<h4 class="modal-title"><span class="glyphicon glyphicon-question-sign"></span> '+(data.title?data.title:'提示信息')+'</h4>'
			  +        '</div>'
			  +        '<div class="modal-body">'
			  +		   	'<form id="'+(data.formId?data.formId:'reasonForm')+'" action="'+(data.formAction?data.formAction:'#')+'">'
			  +        	'<h4 class="red">'+(data.content?data.content:'')+'</h4>'
			  +		   	'<div class="row">'
			  +		   	'<div class="form-group">'
			  +		   	'<label for="reason" class="col-sm-2 control-label">'+(data.reasonDesc?data.reasonDesc:'意见')+'</label>'
			  +		   	'<div class="col-sm-10">'
			  +		   	'<textarea class="form-control" id="'+(data.reasonId?data.reasonId:'reason')+'" name="'+(data.reasonId?data.reasonId:'reason')+'" rows="3" '+(data.reasonRequired=='true'?'required':'')+'></textarea>'
			  +		   	'</div></div></div>'
			  +			'</form>'
			  +        '</div>'
			  +        '<div class="modal-footer">'
			  +          '<button data-bb-handler="cancel"  type="button" class="btn btn-default">关闭</button>'
			  +          '<button data-bb-handler="confirm" type="button" class="btn btn-primary">'+(data.confirmDesc?data.confirmDesc:'确认')+'</button>'
			  +        '</div>' 
			  +     '</div>' 
			  +   '</div>' 
			  + '</div>');
	$(document.body).append(modal);
	modal.modal();
	modal.find(".close").click(function() {
		modal.modal("hide");
	});
	modal.find(".btn-default").click(function() {
		modal.modal("hide");
		if (typeof (cancelFun) == "function") {
			cancelFun();
		}
	});
	modal.find(".btn-primary").click(function() {
		if (typeof (confirmFun) == "function") {
			var r = confirmFun();
			if(r){
				modal.modal("hide");
			}
		}
	});
	modal.on('hidden.bs.modal', function(e) {
		modal.remove();
	});
};

Chelper.fun.paramsHtml = function(item) {
	var _sValue = location.search.match(new RegExp("[\?\&]" + item + "=([^\&]*)(\&?)", "i"));
	return _sValue ? _sValue[1] : _sValue;
};
Chelper.fun.isChinese = function(value) {
	var myReg = /^[\u4e00-\u9fa5]+$/;
	if (!myReg.test(value)) {
		return false;
	} else {
		return true;
	}
};
Chelper.fun.isNull = function(value) {
	if (value === undefined || value === null) {
		return true;
	}
	return false;
};
Chelper.fun.isNotNull = function(value) {
	return !Chelper.fun.isNull(value);
};
Chelper.fun.isEmpty = function(value) {
	if (Chelper.fun.isNull(value) || value.trim() === "") {
		return true;
	} else {
		return false;
	}
};
Chelper.fun.parseInt = function(value, radio) {
	if (value.toString().trim() === "") {
		return 0;
	} else {
		return parseInt(value, radio ? radio : 10);
	}
};
Chelper.fun.getValidValue = function(id) {
	var value = $("#" + id).val();
	if (value && value !== "-1" && value !== -1) {
		return value;
	} else {
		return "";
	}
};
Chelper.fun.id = function(id, target) {
	if (id) {
		target = target || "self";
		return window[target].document.getElementById(id);
	} else {
		return undefined;
	}
};
Chelper.fun.numberKeyupDom = function(dom, min, max, success, required) {
	dom.onkeyup = function() {
		if (dom.value !== "") {
			dom.value = this.value.replace(/[^\d]/g, ""); // 清除“数字”以外的字符
			var _nValue = Chelper.fun.parseInt(this.value);
			if (_nValue < min) {
				this.value = min;
			} else if (_nValue > max) {
				this.value = max;
			}
			if (typeof (success) === 'function') {
				success(dom.value);
			}
		}
	};
	dom.onblur = function() {
		if (typeof (success) === 'function') {
			if (typeof (required) == "undefined" || required != false) {
				required = true;
			}
		} else {
			if (success != false) {
				required = true;
			} else {
				required = false;
			}
		}
		if (required) {
			if (dom.value === "") {
				dom.value = min;
				if (typeof (success) === 'function') {
					success();
				}
			} else {
				var _nValue = Chelper.fun.parseInt(this.value);
				if (_nValue < min) {
					dom.value = min;
					if (typeof (success) === 'function') {
						success();
					}
				}
			}
		} else {
			if (dom.value != "") {
				var _nValue = Chelper.fun.parseInt(this.value);
				if (_nValue < min) {
					dom.value = min;
					if (typeof (success) === 'function') {
						success();
					}
				}
			}
		}
	};
};
Chelper.fun.numberKeyup = function(id, min, max, success, required) {
	var dom = Chelper.fun.id(id);
	if (dom) {
		Chelper.fun.numberKeyupDom(dom, min, max, success, required);
	}
};

$(document).ajaxComplete(function(target, xtr) {
	var flag = xtr.getResponseHeader("sessionstatus");
	if (flag && flag === "nopermission") {
		Chelper.fun.message("没有足够的权限");
	}
	if (flag && flag === "nologin") {
		location.href = Chelper.path + "/index.jsp";
	}
});

Chelper.fun.logout = function(){
	setTimeout(function(){
		location.href = Chelper.path + "/logout.htm";
	}, 500);
}

Chelper.fun.showAndHidenDiv = function(showId,hidenId){
	$("#"+showId).css('display','block'); 
	$("#"+hidenId).css('display','none');
}

Chelper.fun.numberToMoney = function(s, n) {
    n = n > 0 && n <= 20 ? n : 2;
    s = parseFloat((s + "").replace(/[^\d\.-]/g, "")).toFixed(n) + "";
    var l = s.split(".")[0].split("").reverse(), r = s.split(".")[1];
    t = "";
    for (i = 0; i < l.length; i++) {
        t += l[i] + ((i + 1) % 3 == 0 && (i + 1) != l.length ? "," : "");
    }
    return t.split("").reverse().join("") + "." + r;
}

Chelper.fun.moneyToNumber = function(s) {
    return parseFloat(s.replace(/[^\d\.-]/g, ""));
}