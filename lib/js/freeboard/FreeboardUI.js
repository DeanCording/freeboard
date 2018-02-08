function FreeboardUI()
{
    /* Freeboard measures sizes in blocks. A block is one row by one column.  The height of the rows
     and width of the columns can be set by the user. */

	var PANE_MARGIN = 10;
	var PANE_WIDTH = 100;
    var ROW_HEIGHT = 35;
	var COLUMN_WIDTH = PANE_MARGIN + PANE_WIDTH;

    var WIDGET_MARGIN = 0;

    var animate = true;

    this.rowHeight = ko.observable(ROW_HEIGHT);
    this.paneWidth = ko.observable(PANE_WIDTH);


	var loadingIndicator = $('<div class="wrapperloading"><div class="loading up" ></div><div class="loading down"></div></div>');
	var dashboardGrid;


    function init() {
        // Initialize dashboard grid
        dashboardGrid = $("#dashboardGrid").gridster({
            namespace : "#dashboardGrid",
            widget_margins        : [PANE_MARGIN, PANE_MARGIN],
            widget_base_dimensions: [PANE_WIDTH, ROW_HEIGHT],
            extra_cols: 0,
            max_rows: Math.floor(window.screen.availHeight / (ROW_HEIGHT + PANE_MARGIN)),
            shift_widgets_up: false,
            autogrow_cols: true,
            collision: {
                wait_for_mouseup: true
            },
            resize: {
                enabled : true,
                stop : function (grid, event, ui, widget) {
                    var width = Math.floor(ui.width()/Math.floor(ui.width() / PANE_WIDTH));
                    $('.widgets',ui).first().gridster().data('gridster').resize_widget_dimensions({
                            widget_base_dimensions: [width, ROW_HEIGHT]});
                }
            }
        }).data("gridster");

        dashboardGrid.disable();
    }

	function addPane(element, viewModel, paneId, isEditing){

		var width = parseInt(viewModel.col_width());
		var height = parseInt(viewModel.row_height());
        var row = parseInt(viewModel.row);
        var col = parseInt(viewModel.col);

        var widgetWidth = Math.floor(((width * COLUMN_WIDTH) - PANE_MARGIN) / width);
        var widgetHeight = ROW_HEIGHT;

		dashboardGrid.add_widget(element, width, height, col, row);

        viewModel.paneId(paneId);
        viewModel.gridster = $(".widgets", element).first().gridster({
            namespace: "#" + paneId,
            widget_margins: [WIDGET_MARGIN, WIDGET_MARGIN],
            widget_base_dimensions: [widgetWidth, widgetHeight],
        }).data("gridster");

        viewModel.gridster.enable();

		if(isEditing){
			showPaneEditIcons(true);
		}

//		updatePositionForScreenSize(viewModel, Number($(element).attr("data-row")),
//                                    Number($(element).attr("data-col")));

		$(element).attrchange({
			trackValues: true,
			callback   : function(event){
                switch (event.attributeName) {
                    case "data-row":
                        viewModel.row = parseInt(event.newValue);
                        break;
                    case "data-col":
                        viewModel.col = parseInt(event.newValue);
                        break;
                    case "data-sizex":
                        viewModel.col_width(parseInt(event.newValue));
                        break;
                    case "data-sizey":
                        viewModel.row_height(parseInt(event.newValue));
                        break;
                }
            }
        });

    }

	function addWidget(element, viewModel) {

 		var width = Number(viewModel.width());
		var height = Number(viewModel.height());

        var gridster = $(element).parent().parent().prev().children(".widgets").first().gridster().data('gridster');

        gridster.add_widget(element, width, height);

		attachWidgetEditIcons(element);

    }

   	function removeWidget(element) {

        var gridster = $(element).parent().parent().prev().children(".widgets").first().gridster().data('gridster');

        gridster.remove_widget(element);
    }


	function showLoadingIndicator(show){

		if(show){
			loadingIndicator.fadeOut(0).appendTo("body").fadeIn(500);
		} else {
    		loadingIndicator.fadeOut(500).remove();
		}
	}

	function showPaneEditIcons(show){

		var animateLength = (animate) ? 250 : 0;

		if(show){
			$(".pane-tools").fadeIn(animateLength);
		} else {
			$(".pane-tools").fadeOut(animateLength);
		}
	}

	function attachWidgetEditIcons(element){

		$(element).on("mouseenter",function(){showWidgetEditIcons(this, true);})
        .on("mouseleave", function(){showWidgetEditIcons(this, false);});
	}

	function showWidgetEditIcons(element, show){

		if(show){

			$(element).find(".sub-section-tools").fadeIn(250);
		} else {
			$(element).find(".sub-section-tools").fadeOut(250);
		}
	}

	function showEditing(show) {

 		if(show) {
 			$(".gridster .gs_w").css({cursor: "pointer"});
 			attachWidgetEditIcons($(".sub-section"));
 			dashboardGrid.enable().enable_resize();
            $(".widgets").each(function(){$(this).gridster().data('gridster').enable();});
            $("#edit-dashboard label").text("Lock");
            $("#edit-dashboard i").removeClass("icon-edit").addClass("icon-lock");
            $("#add-pane").show();
 		} else {
 			$(".gridster .gs_w").css({cursor: "default"});
 			$(".sub-section").unbind();
 			dashboardGrid.disable().disable_resize();
            $(".widgets").each(function(){$(this).gridster().data('gridster').disable();});
            $("#edit-dashboard label").text("Edit");
            $("#edit-dashboard i").removeClass("icon-lock").addClass("icon-edit");
            $("#add-pane").hide();
         }

		showPaneEditIcons(show);
    }

   	function toggleMenu(event) {

        if (event === undefined) return;

        event.stopPropagation();
        var animateLength = (animate) ? 250 : 0;
        var adminBar = $("#admin-bar");
 		var barHeight = adminBar.height() - 50;

 		if(!adminBar.data("shown")) {
   			adminBar.show();
 			adminBar.animate({"bottom": "50px"}, animateLength);
			adminBar.data("shown", true);
 		} else {
            $('.save-option', adminBar).hide();
            $('#save-dashboard', adminBar).data('options-shown', false);
            adminBar.animate({"bottom": "-" + barHeight + "px"}, animateLength, function() {
                adminBar.hide();
            });
			adminBar.data("shown", false);
         }
    }

    function showDatasources() {

        var animateLength = (animate) ? 250 : 0;
        var datasources = $("#datasources");

        datasources.fadeToggle(animateLength);
    }

    function saveDashboardClicked(event){
		var target = $(event.currentTarget);
		var optionsShown = target.data('options-shown') || false;
		if(!optionsShown){
            event.stopPropagation();
			$('.save-option', target).fadeIn('slow');
		} else {
			$('.save-option', target).fadeOut('slow');
		}
		target.data('options-shown', !optionsShown);
	}

	// Public Functions
	return {
        init : function(){ init();},

        processResize : function(something){return;},

		showLoadingIndicator : function(show){showLoadingIndicator(show);},

		showPaneEditIcons : function(show){showPaneEditIcons(show);},

		attachWidgetEditIcons : function(element){attachWidgetEditIcons(element);},

		addPane : function(element, viewModel, paneId, isEditing){addPane(element, viewModel, paneId, isEditing);},

		removePane : function(element){dashboardGrid.remove_widget(element);},

		removeAllPanes : function(){dashboardGrid.remove_all_widgets();},

		addWidget : function(element, viewModel){addWidget(element, viewModel);},

		removeWidget : function(element, viewModel){removeWidget(element);},

		showEditing : function(show){showEditing(show);},

		toggleMenu : function(event){toggleMenu(event); },

		closeMenu : function(event) {if ($("#admin-bar").data("shown")) toggleMenu(event);},

		showDatasources : function(){ showDatasources();},

		saveDashboardClicked : function(event){ saveDashboardClicked(event);}
 	};
}
