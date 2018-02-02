function FreeboardUI()
{
    /* Freeboard measures sizes in blocks. A block is one row by one column.  The height of the rows
     and width of the columns can be set by the user. */

	var PANE_MARGIN = 10;
	var PANE_WIDTH = 100;
    var ROW_HEIGHT = 35;
	var MIN_COLUMNS = 5;
	var COLUMN_WIDTH = PANE_MARGIN + PANE_WIDTH;

    var WIDGET_MARGIN = 2;

    var animate = true;

    this.rowHeight = ko.observable(ROW_HEIGHT);
    this.paneWidth = ko.observable(PANE_WIDTH);

	var userColumns = MIN_COLUMNS;

	var loadingIndicator = $('<div class="wrapperloading"><div class="loading up" ></div><div class="loading down"></div></div>');
	var dashboardGrid;


    function init() {
        // Initialize dashboard grid
        dashboardGrid = $("#dashboardGrid").gridster({
            namespace : "#dashboardGrid",
            widget_margins        : [PANE_MARGIN, PANE_MARGIN],
            widget_base_dimensions: [PANE_WIDTH, ROW_HEIGHT],
            extra_cols: 0,
            shift_widgets_up: false,
            autogrow_cols: true,
            collision: {
                wait_for_mouseup: true
            },
            resize: {
                enabled : true
            }
        }).data("gridster");

        dashboardGrid.disable();
    }


    function getMaxDisplayableColumnCount()	{
		var available_width = $("#board-content").width();
		return Math.floor(available_width / COLUMN_WIDTH);
	}

	function addPane(element, viewModel, paneId, isEditing){

		var width = Number(viewModel.col_width());
		var height = Number(viewModel.row_height() + 1);

		dashboardGrid.add_widget(element, width, height);

        viewModel.paneId(paneId);
        viewModel.gridster = $(".widgets", element).first().gridster({
            namespace: "#" + paneId,
            widget_margins: [WIDGET_MARGIN, WIDGET_MARGIN],
            widget_base_dimensions: [PANE_WIDTH, ROW_HEIGHT]
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
				if(event.attributeName == "data-row"){
//                    updatePositionForScreenSize(viewModel, Number(event.newValue), undefined);
				}
				else if(event.attributeName == "data-col"){
//                   updatePositionForScreenSize(viewModel, undefined, Number(event.newValue));
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
 			dashboardGrid.enable();
            $(".widgets").each(function(){$(this).gridster().data('gridster').enable();});
            $("#edit-dashboard label").text("Lock");
            $("#edit-dashboard i").removeClass("icon-edit").addClass("icon-lock");
            $("#add-pane").show();
 		} else {
 			$(".gridster .gs_w").css({cursor: "default"});
 			$(".sub-section").unbind();
 			dashboardGrid.disable();
            $(".widgets").each(function(){$(this).gridster().data('gridster').disable();});
            $("#edit-dashboard label").text("Edit");
            $("#edit-dashboard i").removeClass("icon-lock").addClass("icon-edit");
            $("#add-pane").hide();
         }

		showPaneEditIcons(show);
    }

   	function toggleMenu() {

        var animateLength = (animate) ? 250 : 0;
        var adminBar = $("#admin-bar");
 		var barHeight = adminBar.height() - 50;

 		if(!adminBar.data("shown")) {
   			adminBar.show();
 			adminBar.animate({"bottom": "50px"}, animateLength);
			adminBar.data("shown", true);
 		} else {
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

		toggleMenu : function(){toggleMenu(); },

		showDatasources : function(){ showDatasources();}
 	};
}
