// # Building a Freeboard2 Widget Plugin
//
// A freeboard2 plugin is simply a javascript file that is loaded into a web page after the main freeboard.js file is loaded.
//
// Let's get started with an example of a widget plugin.
//
// -------------------

// Best to encapsulate your plugin in a closure, although not required.
(function() {
    // ## A Widget Plugin
    //
    // -------------------
    // ### Widget Definition
    //
    // -------------------
    // **freeboard.loadWidgetPlugin(definition)** tells freeboard that we are giving it a widget plugin. It expects an object with the following:
    freeboard.loadWidgetPlugin({
        // **type_name** : Internal unique widget name
        type_name   : "example_widget",
        // **display_name** : Descriptive name displayed to user
        display_name: "Widget Plugin Example",
        // **description** : Descriptive text displayed to user
        description : "Some sort of description <strong>with optional html!</strong>",
        // **external_scripts** : Any external scripts that should be loaded before the plugin instance is created.
//        external_scripts: [
//            "http://mydomain.com/myscript1.js", "http://mydomain.com/myscript2.js"
//        ],
        // **fill_size** : If this is set to true, the widget will fill be allowed to fill the entire space given it, otherwise it will contain an automatic padding of around 10 pixels around it.
        fill_size : false,

        // *settings* : Widget setting fields
        settings    : [
            {
                // **name** : internal setting name
                name        : "the_text",
                // **display_name**: descriptive name displayed to user
                display_name: "Some Text",
                // **description** : Help text about the field
                description : "Text to be displayed",
                // **type** : type of input field - text, calculated, integer, number, option, array, boolean
                type        : "calculated",
                // **multi_input** : true if field can have multiple values
                multi_input : false,
                // **suffix** : text to add to end of field
                suffix      : "",
                // **default** : default value
                default     : "Hello",
                // **required** : true if field is required
                required    : true
            },
            {
                name        : "size",
                display_name: "Size",
                type        : "option",
                // **options** : list of options for option dropdown
                options     : [
                    {
                        name : "Regular",
                        value: "regular"
                    },
                    {
                        name : "Big",
                        value: "big"
                    }
                ]
            },
            {
                name      : "array_setting",
                display_name : "Array",
                type: "array",
                settings: [
                    {
                        name: "name",
                        display_name: "Name",
                        type: "text"
                    },
                    {
                        name: "value",
                        display_name: "Value",
                        type: "text"
                    }
                ]
            }
        ],
        // Callback to create new instance of widget
        newInstance   : function(settings, newInstanceCallback)    {
            newInstanceCallback(new myWidgetPlugin(settings));
        }
    });

    // ### Widget Implementation
    //
    // -------------------
    // Here we implement the actual widget plugin. We pass in the settings;
    var myWidgetPlugin = function(settings)    {
        var self = this;
        var currentSettings = settings;

        // Here we create an element to hold the text we're going to display. We're going to set the value displayed in it below.
        var myTextElement = $("<span></span>");

        // **render(containerElement)** (required) : A public function we must implement that will be called //when freeboard wants us to render the contents of our widget. The container element is the DIV that will surround the widget.
        self.render = function(containerElement) {
            // Here we append our text element to the widget container element.
            $(containerElement).append(myTextElement);
        }

        // **getHeight()** (required) : A public function we must implement that will be called when freeboard wants to know how big we expect to be when we render, and returns a height. This function will be called any time a user updates their settings (including the first time they create the widget).
        //
        // Note here that the height is not in pixels, but in rows.
        self.getHeight = function()    {
            if(currentSettings.size == "big") {
                return 2;
            }
            else {
                return 1;
            }
        }

        // **getWidth()** (required) : A public function we must implement that will be called when freeboard wants to know how big we expect to be when we render, and returns a width. This function will be called any time a user updates their settings (including the first time they create the widget).
        //
        // Note here that the width is not in pixels, but in columns.
        self.getWidth = function() {
            if(currentSettings.size == "big") {
                return 2;
            }
            else{
                return 1;
            }
        }

        // **onSizeChanged()** (optional): A public function we can implement that will be called when a user changes the width of a pane.

        self.onSizeChanged = function() {

        }

        // **onSettingsChanged(newSettings)** (required) : A public function we must implement that will be called when a user makes a change to the settings.
        self.onSettingsChanged = function(newSettings) {
            // Normally we'd update our text element with the value we defined in the user settings above (the_text), but there is a special case for settings that are of type **"calculated"** -- see below.
            currentSettings = newSettings;
        }

        // **onCalculatedValueChanged(settingName, newValue)** (required) : A public function we must implement that will be called when a calculated value changes. Since calculated values can change at any time (like when a datasource is updated) we handle them in a special callback function here.
        self.onCalculatedValueChanged = function(settingName, newValue)    {
            // Remember we defined "the_text" up above in our settings.
            if(settingName == "the_text"){
                // Here we do the actual update of the value that's displayed in on the screen.
                $(myTextElement).html(newValue);
            }
        }

        // **onDispose()** (required) : A public function we must implement that will be called when this instance of this plugin is no longer needed. Do anything you need to cleanup after yourself here.
        self.onDispose = function() {
        }
    }
}());
