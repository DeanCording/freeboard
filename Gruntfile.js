module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        concat: {
            css: {
                src: [
                    'lib/css/thirdparty/jquery.gridster.min.css',
                    'lib/css/thirdparty/codemirror.css',
                    'lib/css/thirdparty/codemirror-ambiance.css',
                    'lib/css/freeboard/styles.css',
                    'lib/css/freeboard/index.css'
                ],
                dest: 'css/freeboard.css'
            },
            thirdparty : {
                src : [
                    [
                       'lib/js/thirdparty/head.js',
                        'lib/js/thirdparty/knockout.js',
                        'lib/js/thirdparty/jquery.js',
                        'lib/js/thirdparty/jquery-ui.js',
                        'lib/js/thirdparty/underscore.js',
                        'lib/js/thirdparty/jquery.gridster.js',
                        'lib/js/thirdparty/jquery.caret.js',
						'lib/js/thirdparty/jquery.xdomainrequest.js',
                        'lib/js/thirdparty/codemirror.js',
                        'lib/js/thirdparty/paho-mqtt-min.js'
                    ]
                ],
                dest : 'js/freeboard.thirdparty.js'
            },
			fb : {
				src : [
                    'lib/js/freeboard/DatasourceModel.js',
                    'lib/js/freeboard/DeveloperConsole.js',
                    'lib/js/freeboard/DialogBox.js',
                    'lib/js/freeboard/FreeboardModel.js',
                    'lib/js/freeboard/FreeboardUI.js',
                    'lib/js/freeboard/JSEditor.js',
                    'lib/js/freeboard/PaneModel.js',
                    'lib/js/freeboard/PluginEditor.js',
                    'lib/js/freeboard/ValueEditor.js',
                    'lib/js/freeboard/WidgetModel.js',
                    'lib/js/freeboard/freeboard.js',
                    'lib/js/freeboard/index.js'
				],
				dest : 'js/freeboard.js'
			},
            plugins : {
                src : [
                    'plugins/freeboard/*.js'
                ],
                dest : 'js/freeboard.plugins.js'
            },
            'thirdparty_plugins' : {
                src : [
                    'plugins/thirdparty/raphael.js',
                    'plugins/thirdparty/justgage.js',
                    'plugins/thirdparty/highcharts.js',
                    'plugins/thirdparty/exporting.js',
                    'plugins/thirdparty/jquery.sparkline.min.js',
                    'plugins/thirdparty/ibm.iotfoundation.plugin.js',
                    'plugins/thirdparty/paho.mqtt.plugin.js',
                    'plugins/thirdparty/highcharts.plugin.js',
                    'plugins/thirdparty/interactive.gauge.plugin.js',
                    'plugins/thirdparty/interactive.indicator.plugin.js',
                    'plugins/thirdparty/osinfos.datasources.js',
                    'plugins/thirdparty/html.widgets.js',

                ],
                dest : 'js/thirdparty.plugins.js'
            },
            'fb_plugins' : {
                src : [
                    'js/freeboard.js',
                    'js/freeboard.plugins.js'
                ],
                dest : 'js/freeboard_plugins.js'
            }
        },
        cssmin : {
            css:{
                src: 'css/freeboard.css',
                dest: 'css/freeboard.min.css'
            }
        },
        uglify : {
            fb: {
                files: {
                    'js/freeboard.min.js' : [ 'js/freeboard.js' ]
                }
            },
            plugins: {
                files: {
                    'js/freeboard.plugins.min.js' : [ 'js/freeboard.plugins.js' ]
                }
            },
            thirdparty :{
                options: {
                    mangle : false,
                    beautify : false,
                    compress: {}
                },
                files: {
                    'js/freeboard.thirdparty.min.js' : [ 'js/freeboard.thirdparty.js' ]
                }
            },
            'fb_plugins': {
                files: {
                    'js/freeboard_plugins.min.js' : [ 'js/freeboard_plugins.js' ]
                }
            },
            'thirdparty_plugins': {
                files: {
                    'js/thirdparty.plugins.min.js' : [ 'js/thirdparty.plugins.js' ]
                }
            }
        },
        'string-replace': {
            css: {
                files: {
                    'css/': 'css/*.css'
                },
                options: {
                    replacements: [{
                        pattern: /..\/..\/..\/img/ig,
                        replacement: '../img'
                    }]
                }
            }
        },
        compress: {
            main: {
                options: {
                    archive: 'freeboard.nw',
                    mode: 'zip'
                },
                files: [
                    {src: ['package.json','index.html','js/freeboard_plugins.min.js',
                        'js/thirdparty.plugins.min.js','js/freeboard.thirdparty.min.js',
                        'css/freeboard.min.css', 'img/*', 'node_modules/os-utils/*']}
                ]
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-string-replace');
    grunt.loadNpmTasks('grunt-contrib-compress');
    grunt.registerTask('default', [ 'concat:css', 'cssmin:css', 'concat:fb', 'concat:thirdparty', 'concat:plugins', 'concat:fb_plugins', 'concat:thirdparty_plugins', 'uglify:fb', 'uglify:plugins', 'uglify:fb_plugins', 'uglify:thirdparty_plugins','uglify:thirdparty', 'string-replace:css',
    'compress:main'
    ]);
};
