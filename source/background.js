function Tab(tab) {
	this.url = tab.url;
	this.title = tab.title;
}

function Window(window) {
	this.tabs = [];
}

function Session(id) {
	this.name = "A name";
	this.windows = [];
	this.id = id;
	this.current = false;
}


function Sessions() {
	this.sessions = [];
}

function findCurrentSession() {
	for (var i = 0; i < getSessions().sessions.length; i++) {
		if (getSessions().sessions[i].current) {
			return getSessions().sessions[i];
		}
	}
}

function getCurrentSession() {
	if (currentSession) {
		return currentSession;
	}
	var session = findCurrentSession();
	if (session) {
		currentSession = session;
	} else {
		currentSession = createSession();
		updateCurrentSession();
	}
	return currentSession;
}

var currentSession = null;
var sessions = null;

function getSessions() {
	if (sessions == null) {
		loadSessions();
	}
	return sessions;
}

function saveSessions() {
	console.log("save");
	if (sessions) {
		localStorage["sessions"] = JSON.stringify(sessions);
	}
}

function loadSessions() {
	if (!localStorage["sessions"]) {
		var json = JSON.stringify(new Sessions());
		localStorage["sessions"] = json;
	}
	sessions = JSON.parse(localStorage["sessions"]);
}

function closeAllInactive(callback) {
	chrome.windows.getCurrent({populate: true}, function (currentWindow) {
		var currentTab = currentWindow.tabs[0];
		chrome.windows.getAll({ populate : true }, function(windows) {
			for (var i = 0; i < windows.length; i++) {
				if (windows[i].id != currentWindow.id) {
					chrome.windows.remove(windows[i].id);
				} else {
					$.each(windows[i].tabs, function(ix, tab) {
						if(tab.id != currentTab.id) {
							chrome.tabs.remove(tab.id);
						}
					});
				}
			}
		});
		callback(currentTab, currentWindow);
	});
}

function newSession() {
	var session = createSession();
	switchCurrentSession(session);
}

function createSession() {
	var now = new Date();
	var session = new Session(now.getMilliseconds());
	session.name = "Generated " + now;
	getSessions().sessions.push(session);
	return session;
}

function switchCurrentSession(session) {
	closeAllInactive(function (currentTab, currentWindow)  {
		$.each(session.windows, function(ix, window) {
			if (ix == 0) {
				$.each(window.tabs, function(ix, tab) {
					chrome.tabs.create({ windowId: currentTab.windowId, url: tab.url}, function() {
						if (ix == 0) chrome.tabs.remove(currentTab.id);
					});
				});
			} else {
				chrome.windows.create({},  function(w) {
					$.each(window.tabs, function(ix, tab) {
						chrome.tabs.create({ windowId: w.id, url: tab.url});
					});
				});
			}
		});
	});
	if (currentSession) currentSession.current = false;
	currentSession = session;
	currentSession.current = true;
	saveSessions();
}



function updateCurrentSession() {
	getAllWindows(function(windows) {
		getCurrentSession().windows = windows;
	});
}

function clear() {
	console.log("clear");
	localStorage.removeItem("sessions");
	sessions = null;
}

function getAllWindows(callback) {
	chrome.windows.getAll({ populate : true }, function(windows) {
		var retWindows = [];
		for (var i = 0; i < windows.length; i++) {
			var w = new Window(windows[i]);
			retWindows.push(w);
			for (var j = 0; j < windows[i].tabs.length; j++) {
				w.tabs.push(new Tab(windows[i].tabs[j]));
			}
		}
		callback(retWindows);
	});
}




chrome.tabs.onUpdated.addListener(function() {
	console.log("tab updated");
	updateCurrentSession();
	saveSessions();
});

//TODO: switching sessions also triggers events
chrome.tabs.onCreated.addListener(function() {
	console.log("tab created");
	updateCurrentSession();
	saveSessions();
});
chrome.tabs.onRemoved.addListener(function() {
	console.log("tab removed");
	updateCurrentSession();
	saveSessions();
});

chrome.tabs.onAttached.addListener(function() {
	console.log("tab attached");
	updateCurrentSession();
	saveSessions();
});

chrome.tabs.onDetached.addListener(function() {
	console.log("tab detached");
	updateCurrentSession();
	saveSessions();
});

chrome.windows.onCreated.addListener(function() {
	console.log("window created");
	updateCurrentSession();
	saveSessions();
});

chrome.windows.onRemoved.addListener(function() {
	console.log("window removed");
	updateCurrentSession();
	saveSessions();
});
