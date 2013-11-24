module.exports = (grunt)->
    grunt.initConfig
        pkg: grunt.file.readJSON('package.json')
        coffee:
            compile:
                files:
                    'build/main.js': 'lib/*.coffee'
        watch:
            coffee:
                files: ['lib/*.coffee']
                tasks: 'coffee'

    grunt.loadNpmTasks('grunt-contrib-coffee')
    grunt.loadNpmTasks('grunt-contrib-watch')
    grunt.registerTask('default', ['coffee'])