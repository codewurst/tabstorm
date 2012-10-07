
function updateTabs() {	
	var sessions = chrome.extension.getBackgroundPage().getSessions().sessions;
	$.each(sessions, function(ix, cSession) {
		var sEl = $("<li>" + cSession.name + "</li>").appendTo($("#sessions"));
		sEl.click(function() {
			chrome.extension.getBackgroundPage().switchCurrentSession(cSession);
			return false;
		});
		var windowsEl = $("<ul class='windows'></ul>").appendTo(sEl);
		$.each(cSession.windows, function(ix, cWindow) {
			var wEl = $("<li>&nbsp;</li>").appendTo(windowsEl);
			var tabsEl = $("<ul class='tabs'></ul>").appendTo(wEl);
			$.each(cWindow.tabs, function(ix, cTab) {
				$("<li>" + cTab.url + "</li>").appendTo(tabsEl);
			});
		});
		$(function() {
			$( ".tabs" ).sortable({
				connectWith: ".tabs"
			}).disableSelection();
		});
	});
	
}

function close() {
	window.close();
}

$(function() {
  updateTabs();
  
  $("#save").click(function() {
	chrome.extension.getBackgroundPage().saveSessions();
	return false;
  });
  $("#newSession").click(function() {
	chrome.extension.getBackgroundPage().newSession();
	return false;
  });
  $("#clear").click(function() {
	chrome.extension.getBackgroundPage().clear();
	return false;
  });
  
});


