var currentDashboardState = "";
var canEdit = false;
var wasEditing = false;

(function() {
    var
        fullScreenApi = {
            supportsFullScreen: false,
            isFullScreen: function() { return false; },
            requestFullScreen: function() {},
            cancelFullScreen: function() {},
            fullScreenEventName: '',
            prefix: ''
        },
        browserPrefixes = 'webkit moz o ms khtml'.split(' ');

    // check for native support
    if (typeof document.cancelFullScreen != 'undefined') {
        fullScreenApi.supportsFullScreen = true;
    } else {
        // check for fullscreen support by vendor prefix
        for (var i = 0, il = browserPrefixes.length; i < il; i++ ) {
            fullScreenApi.prefix = browserPrefixes[i];

            if (typeof document[fullScreenApi.prefix + 'CancelFullScreen' ] != 'undefined' ) {
                fullScreenApi.supportsFullScreen = true;

                break;
            }
        }
    }

    // update methods to do something useful
    if (fullScreenApi.supportsFullScreen) {
        fullScreenApi.fullScreenEventName = fullScreenApi.prefix + 'fullscreenchange';

        fullScreenApi.isFullScreen = function() {
            switch (this.prefix) {
                case '':
                    return document.fullScreen;
                case 'webkit':
                    return document.webkitIsFullScreen;
                default:
                    return document[this.prefix + 'FullScreen'];
            }
        }
        fullScreenApi.requestFullScreen = function(el) {
            return (this.prefix === '') ? el.requestFullScreen() : el[this.prefix + 'RequestFullScreen']();
        }
        fullScreenApi.cancelFullScreen = function(el) {
            return (this.prefix === '') ? document.cancelFullScreen() : document[this.prefix + 'CancelFullScreen']();
        }
    }

    // jQuery plugin
    if (typeof jQuery != 'undefined') {
        jQuery.fn.requestFullScreen = function() {

            return this.each(function() {
                if (fullScreenApi.supportsFullScreen) {
                    fullScreenApi.requestFullScreen(this);
                }
            });
        };
    }

    // export api
    window.fullScreenApi = fullScreenApi;
})();

function updateFullScreenStatus()
{
    if(fullScreenApi.isFullScreen())
    {
        wasEditing = freeboard.isEditing();
        freeboard.setEditing(false, false);

        $("#full-screen").text("Shrink");
        $("#full-screen-icon").removeClass("icon-resize-full").addClass("icon-resize-small");
    }
    else
    {

        if(wasEditing)
        {
            freeboard.setEditing(true, true);
        }

        $("#full-screen").text("Fullscreen");
        $("#full-screen-icon").addClass("icon-resize-full").removeClass("icon-resize-small");
    }
}

function toggleFullScreen()
{
    if(fullScreenApi.isFullScreen())
    {
        fullScreenApi.cancelFullScreen();
    }
    else
    {
        fullScreenApi.requestFullScreen(document.documentElement);
    }
}








$(function()
{ //DOM Ready

    if(!fullScreenApi.supportsFullScreen)
    {
        $("#full-screen-action").hide();
    }

    $(document).on(fullScreenApi.fullScreenEventName, function(){
        updateFullScreenStatus();
    });

canEdit = true;
});
