module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        less: {
            development: {
                options: {
                    //paths: ["../client/public/less"]
                    compress: true,
                    cleancss: true
                },
                files: {
                    "web/public/styles/main.css" : "web/public/less/main.less"
                }
            }
        },
        watch: {
            less: {
                files: "web/public/less/*.less",
                tasks: ["less"],
                options: {
                    interrupt: true
                }
            },
            livereload: {
                options: {
                    livereload: true
                },
                files: ["web/public/styles/main.css"]
            }
        },
        uglify: {
            options: {
                mangle: true
            },
            my_target: {
                files: {
                    'js/build/lib.min.js': ['js/bower_components/jquery/dist/jquery.min.js', 'js/others/three.min.js', 'js/others/orbitControll.js', 'js/others/xmlToJson.js', 'js/others/detector.js'],
                    'js/build/main.min.js': ['js/shader.js', 'js/nasaRequest.js', 'js/nasaWebservice.js', 'js/main.js', 'js/action.js'],
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    grunt.registerTask('default', ['less', 'watch']);
    grunt.registerTask('compile', ['uglify']);
    
};
