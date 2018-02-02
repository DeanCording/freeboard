Settings = function(theFreeboardModel)
{
	function showSettings()
	{
		var pluginScriptsInputs = [];
		var container = $('<div class="form-row"></div>');

        container.append('<div id="setting-row-instance_name" class="form-row">' +
                        '    <div class="form-label"><label class="control-label">Page Title</label></div>' +
                        '    <div id="setting-value-container-page_title" class="form-value">' +
                        '      <div class="calculated-setting-row">' +
                        '         <input class="calculated-value-input" id="pageName" type="text">' +
                        '      </div>' +
                        '    </div>' +
                        '</div>');

        container.append('<div id="setting-row-header_image" class="form-row">' +
                '    <div class="form-label"><label class="control-label">Header Image</label></div>' +
                '    <div id="setting-value-container-header_image" class="form-value">' +
                '      <div class="calculated-setting-row">' +
                '         <input class="calculated-value-input" id="headerImage" type="text">' +
                '      </div>' +
                '    </div>' +
                '</div>');

        $('#pageName', container).val(theFreeboardModel.dashboardName());
        $('#headerImage', container).val(theFreeboardModel.header_image());


        var plugins = $('<div id="setting-row-plugins" class="form-row"></div>');
        plugins.append('<div class="form-label"><label class="control-label">Plugin Script URLs</label></div>');

        var pluginsTable = $('<div class="form-value"></div>');
		var table = $('<table class="table table-condensed sub-table"></table>');

		var tableBody = $("<tbody></tbody>");

		table.append(tableBody);
		pluginsTable.append(table);
        plugins.append(pluginsTable);
        container.append(plugins);

        var addScriptRow = $('<div class="form-row"></div>').append('<div class="form-label"></div>');
        var addScriptItem = $('<div class="form-value"></div>');
        var addScript = $('<p class="text-button">ADD</p>');

        addScriptItem.append(addScript).append('<div class="setting-description"><p>Here you can add references to other scripts to load datasource or widget plugins.</p>' +
            '<p>To learn how to build plugins for freeboard, please visit <a target="_blank" href="docs/plugin_example.html">here</a></p></div>');

        addScriptRow.append(addScriptItem);
        container.append(addScriptRow);

		function refreshScript(scriptURL)
		{
			$('script[src="' + scriptURL + '"]').remove();
		}

		function addNewScriptRow(scriptURL)
		{
			var tableRow = $('<tr></tr>');
			var tableOperations = $('<ul class="board-toolbar"></ul>');
			var scriptInput = $('<input type="text">');
			var deleteOperation = $('<li><i class="icon-trash icon-white"></i></li>').click(function(e){
				pluginScriptsInputs = _.without(pluginScriptsInputs, scriptInput);
				tableRow.remove();
			});

			pluginScriptsInputs.push(scriptInput);

			if(scriptURL)
			{
				scriptInput.val(scriptURL);
			}

			tableOperations.append(deleteOperation);
			tableBody
				.append(tableRow
				.append($('<td></td>').append(scriptInput))
					.append($('<td class="table-row-operation">').append(tableOperations)));
		}

		_.each(theFreeboardModel.plugins(), function(pluginSource){

			addNewScriptRow(pluginSource);

		});

		addScript.click(function(e)
		{
			addNewScriptRow();
		});

		new DialogBox(container, "Dashboard Settings", "OK", null, function(){

            theFreeboardModel.dashboardName($("#pageName").val());
            theFreeboardModel.header_image($("#headerImage").val());

			// Unload our previous scripts
			_.each(theFreeboardModel.plugins(), function(pluginSource){

				$('script[src^="' + pluginSource + '"]').remove();

			});

			theFreeboardModel.plugins.removeAll();

			_.each(pluginScriptsInputs, function(scriptInput){

				var scriptURL = scriptInput.val();

				if(scriptURL && scriptURL.length > 0)
				{
					theFreeboardModel.addPluginSource(scriptURL);

					// Load the script with a cache buster
					head.js(scriptURL + "?" + Date.now());
				}
			});

		});
	}

	// Public API
	return {
		showSettings : function()
		{
			showSettings();
		}
	};
};
