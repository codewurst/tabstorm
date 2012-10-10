function updateTabs() {
	var sessions = chrome.extension.getBackgroundPage().getSessions().sessions;
	$.each(sessions, function (ix, cSession) {
		var sEl = $("<li>" + cSession.name + "</li>").appendTo($("#sessions"));
		sEl.click(function () {
			chrome.extension.getBackgroundPage().switchCurrentSession(cSession);
			return false;
		});
		var windowsEl = $("<ul class='windows'></ul>").appendTo(sEl);
		$.each(cSession.windows, function (ix, cWindow) {
			var wEl = $("<li>&nbsp;</li>").appendTo(windowsEl);
			var tabsEl = $("<ul class='tabs'></ul>").appendTo(wEl);
			$.each(cWindow.tabs, function (ix, cTab) {
				$("<li>" + cTab.url + "</li>").appendTo(tabsEl);
			});
		});
		$(function () {
			$(".tabs").sortable({
				connectWith:".tabs"
			}).disableSelection();
		});
	});

}

function close() {
	window.close();
}

$(function () {
	updateTabs();

	filter.init($('#filter'));

	$("#save").click(function () {
		chrome.extension.getBackgroundPage().saveSessions();
		return false;
	});
	$("#newSession").click(function () {
		chrome.extension.getBackgroundPage().newSession();
		return false;
	});
	$("#clear").click(function () {
		chrome.extension.getBackgroundPage().clear();
		return false;
	});

});

// tabfilter
var filter;
if (!filter) {
	filter = {};
}

filter.object = null;
filter.list = null;
filter.emptyString = "Filter";

filter.init = function ($filterInput) {
	filter.list = $('#sessions');
	filter.object = $filterInput;
	filter.object.val(filter.emptyString);
	filter.object.focus(function (e) {
		filter.focus(e);
	});
	filter.object.blur(function (e) {
		filter.blur(e);
	});
	filter.object.keyup(function (e) {
		filter.filter();
	});
}

filter.focus = function (event) {
	if (filter.object.val() == filter.emptyString) {
		filter.object.val('');
	}
}

filter.blur = function (event) {
	if (filter.object.val() == '') {
		filter.object.val(filter.emptyString);
	}
}

filter.filter = function () {
	var filterExpr = filter.object.val();
	console.log('filter for: ', filterExpr);

	$.each($('li', filter.list), function (idx, element) {
		var $e = $(element);

		if ($e.text().indexOf(filterExpr) >= 0) {
			$e.show();
		} else {
			$e.hide();
		}

		if(filterExpr == '') {
			filter.clearFilter();
		}
	});

}

filter.clearFilter = function() {
	$.each($('li', filter.list), function (idx, element) {
		var $e = $(element);
		$e.show();
	});
}
