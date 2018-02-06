function PaneModel(theFreeboardModel, widgetPlugins) {
	var self = this;

	this.title = ko.observable("");
	this.row = 1;
	this.col = 1;

    this.paneId = ko.observable();

	this.col_width = ko.observable(1);
	this.col_width.subscribe(function(newValue)	{
		self.processSizeChange();
	});

    this.row_height = ko.observable(2);

	this.widgets = ko.observableArray();

    this.createWidget = function(newSettings) {
        var newWidget = new WidgetModel(theFreeboardModel, widgetPlugins);
			newWidget.settings(newSettings.settings);
            newWidget.type(newSettings.type);

        self.addWidget(newWidget);
    }

	this.addWidget = function (widget) {
		self.widgets.push(widget);
	}

	this.deleteWidget = function (widget) {
        if (self.widgets.indexOf(widget) > -1) {
            widget.dispose();
            self.widgets.remove(widget);
        }
    }

	this.processSizeChange = function()	{
		// Give the animation a moment to complete. Really hacky.
		// TODO: Make less hacky. Also, doesn't work when screen resizes.
		setTimeout(function(){
			_.each(self.widgets(), function (widget) {
				widget.processSizeChange();
			});
		}, 1000);
	}

	this.serialize = function () {
		var widgets = [];

		_.each(self.widgets(), function (widget) {
			widgets.push(widget.serialize());
		});

		return {
			title: self.title(),
			row: self.row,
			col: self.col,
			col_width: Number(self.col_width()),
			row_height: Number(self.row_height()),
			widgets: widgets
		};
	}

	this.deserialize = function (object) {
		self.title(object.title);

		self.row = object.row;
		self.col = object.col;
		self.col_width(object.col_width || 1);
		self.row_height(object.row_height || 1);

		_.each(object.widgets, function (widgetConfig) {
			var widget = new WidgetModel(theFreeboardModel, widgetPlugins);
			widget.deserialize(widgetConfig);
			self.widgets.push(widget);
		});
	}

	this.dispose = function () {
		ko.utils.arrayForEach(self.widgets(), function (widget) {
			widget.dispose();
		});
	}
}
