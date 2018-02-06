function FreeboardModel(datasourcePlugins, widgetPlugins, freeboardUI) {
	var self = this;

	var SERIALIZATION_VERSION = 1;

	this.version = 0;
	this.isEditing = ko.observable(false);
	this.allow_edit = ko.observable(false);

    this.dashboardName = ko.observable("");
	this.header_image = ko.observable("");
	this.plugins = ko.observableArray();
	this.datasources = ko.observableArray();
	this.panes = ko.observableArray();
	this.datasourceData = {};
	this.processDatasourceUpdate = function(datasourceModel, newData){

		var datasourceName = datasourceModel.name();

		self.datasourceData[datasourceName] = newData;

		_.each(self.panes(), function(pane){

			_.each(pane.widgets(), function(widget){

				widget.processDatasourceUpdate(datasourceName);
			});
		});
	}

	this._datasourceTypes = ko.observable();
	this.datasourceTypes = ko.computed({
		read: function(){

			self._datasourceTypes();

			var returnTypes = [];

			_.each(datasourcePlugins, function(datasourcePluginType){

				var typeName = datasourcePluginType.type_name;
				var displayName = typeName;

				if(!_.isUndefined(datasourcePluginType.display_name)){
					displayName = datasourcePluginType.display_name;
				}

				returnTypes.push({
					name        : typeName,
					display_name: displayName
				});
			});

			return returnTypes;
		}
	});

	this._widgetTypes = ko.observable();
	this.widgetTypes = ko.computed({
		read: function(){

			self._widgetTypes();

			var returnTypes = [];

			_.each(widgetPlugins, function(widgetPluginType){
				var typeName = widgetPluginType.type_name;
				var displayName = typeName;

				if(!_.isUndefined(widgetPluginType.display_name)){
					displayName = widgetPluginType.display_name;
				}

				returnTypes.push({
					name        : typeName,
					display_name: displayName
				});
			});

			return returnTypes;
		}
	});

	this.addPluginSource = function(pluginSource){
		if(pluginSource && self.plugins.indexOf(pluginSource) == -1){
			self.plugins.push(pluginSource);
		}
	}

	this.serialize = function(){

		var panes = [];

		_.each(self.panes(), function(pane){panes.push(pane.serialize());});

		var datasources = [];

		_.each(self.datasources(), function(datasource){datasources.push(datasource.serialize());});

		return {
			version     : SERIALIZATION_VERSION,
            dashboardName : self.dashboardName(),
			header_image: self.header_image(),
			allow_edit  : self.allow_edit(),
			plugins     : self.plugins(),
			panes       : panes,
			datasources : datasources
        };
	}

	this.deserialize = function(object, finishedCallback){

		self.clearDashboard();

		function finishLoad(){


			if(!_.isUndefined(object.allow_edit)){
				self.allow_edit(object.allow_edit);
			} else {
				self.allow_edit(true);
			}
			self.version = object.version || 1;
            self.dashboardName(object.dashboardName);
            self.header_image(object.header_image);

			_.each(object.datasources, function(datasourceConfig){
				var datasource = new DatasourceModel(self, datasourcePlugins);
				datasource.deserialize(datasourceConfig);
				self.addDatasource(datasource);
			});

			_.each(object.panes, function(paneConfig){
				var pane = new PaneModel(self, widgetPlugins);
				pane.deserialize(paneConfig);
				self.panes.push(pane);
			});

			if(self.allow_edit() && self.panes().length == 0){
				self.setEditing(true);
			} else {
                self.setEditing(false);
            }

			if(_.isFunction(finishedCallback)){
				finishedCallback();
			}

			freeboardUI.processResize(true);
		}

		// This could have been self.plugins(object.plugins), but for some weird reason head.js was causing a function to be added to the list of plugins.
		_.each(object.plugins, function(plugin){self.addPluginSource(plugin);});

		// Load any plugins referenced in this definition
		if(_.isArray(object.plugins) && object.plugins.length > 0){
			head.js(object.plugins, function(){finishLoad();});
		} else {
			finishLoad();
		}
	}

	this.clearDashboard = function(){
		freeboardUI.removeAllPanes();
		_.each(self.datasources(), function(datasource){datasource.dispose();});
		_.each(self.panes(), function(pane){pane.dispose();});
		self.plugins.removeAll();
		self.datasources.removeAll();
		self.panes.removeAll();
	}

	this.loadDashboard = function(dashboardData, callback){
		freeboardUI.showLoadingIndicator(true);
		self.deserialize(dashboardData, function(){
			freeboardUI.showLoadingIndicator(false);

			if(_.isFunction(callback)){
				callback();
			}

            freeboard.emit("dashboard_loaded");
		});
	}

	this.loadDashboardFromLocalFile = function(){
		// Check for the various File API support.
		if(window.File && window.FileReader && window.FileList && window.Blob){
			var input = document.createElement('input');
			input.type = "file";
			$(input).on("change", function(event){
				var files = event.target.files;

				if(files && files.length > 0){
					var file = files[0];
					var reader = new FileReader();

					reader.addEventListener("load", function(fileReaderEvent){
						var textFile = fileReaderEvent.target;
						var jsonObject = JSON.parse(textFile.result);
						self.loadDashboard(jsonObject);
						self.setEditing(false);
					});

					reader.readAsText(file);
				}
			});
			$(input).trigger("click");
		} else {
			alert('Unable to load a file in this browser.');
		}
	}


	this.saveDashboard = function(_thisref, event){
		var pretty = $(event.currentTarget).data('pretty');
		var contentType = 'application/octet-stream';
		var a = document.createElement('a');
		if(pretty){
			var blob = new Blob([JSON.stringify(self.serialize(), null, '\t')], {'type': contentType});
		}else{
			var blob = new Blob([JSON.stringify(self.serialize())], {'type': contentType});
		}
		document.body.appendChild(a);
		a.href = window.URL.createObjectURL(blob);
		a.download = "dashboard.json";
		a.target="_self";
		a.click();
	}

	this.createDatasource = function(newSettings) {
        var newDatasource = new DatasourceModel(self, datasourcePlugins);

		newDatasource.name(newSettings.settings.instance_name);
		newDatasource.settings(newSettings.settings);
		newDatasource.type(newSettings.type);

		this.addDatasource(newDatasource);
    }

	this.addDatasource = function(datasource){
        self.datasources.push(datasource);
	}

	this.deleteDatasource = function(datasource){
		delete self.datasourceData[datasource.name()];
		datasource.dispose();
		self.datasources.remove(datasource);
	}

	this.createPane = function(){
		var newPane = new PaneModel(self, widgetPlugins);

		self.addPane(newPane);
	}

	this.addPane = function(pane){
		self.panes.push(pane);
	}

	this.deletePane = function(pane){
		pane.dispose();
		self.panes.remove(pane);
	}

	this.deleteWidget = function(widget){
		ko.utils.arrayForEach(self.panes(), function(pane){pane.deleteWidget(widget);});
	}

	this.setEditing = function(editing){
		// Don't allow editing if it's not allowed
		if(!self.allow_edit() && editing){
			return;
		}

		self.isEditing(editing);
		freeboardUI.showEditing(editing);
	}

	this.toggleEditing = function(){
		var editing = !self.isEditing();
		self.setEditing(editing);
	}
}
