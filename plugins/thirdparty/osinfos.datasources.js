(function () {
	
	var osinfosDatasource = function (settings, updateCallback) {
		var self = this;
		var currentSettings = settings;
		var timer;
		var os  = require('os-utils');
		var started = true;


		this.updateNow = function () {
			if (started) {
				os.cpuUsage(function(v){
				    var cpuUsage = (100 * v).toFixed(2);
					var data = {
						'cpuUsage': cpuUsage,
						'platform': os.platform(),
						'cpuCount': os.cpuCount(),
						'freemem': (os.freemem()).toFixed(0),
						'totalmem': (os.totalmem()).toFixed(0),
						'freememPercentage': (100 * os.freememPercentage()).toFixed(2),
						'sysUptime': (os.sysUptime()).toFixed(3),
						'processUptime': (os.processUptime()).toFixed(3)
					};
					updateCallback(data);
					self.updateNow();
				});
			}
						
		};
		
		this.stop = function() {
			started = false;
		};

		this.onDispose = function () {
			started = false;
		};

		this.onSettingsChanged = function (newSettings) {
			currentSettings = newSettings;
		};
		
		self.updateNow();

	};

	freeboard.loadDatasourcePlugin({
		"type_name": "osinfos",
		"display_name": "OS Informations",
		"settings": [
		],
		newInstance: function (settings, newInstanceCallback, updateCallback) {
			newInstanceCallback(new osinfosDatasource(settings, updateCallback));
		}
	});
	

}());
