module.exports = (grunt)->
    grunt.initConfig
        pkg: grunt.file.readJSON('package.json')
        coffee:
            compile:
                options:
                    join: true
                files:
                    'build/main.js': [
                        'lib/utils.coffee'
                        'lib/device.coffee'
                        'lib/route.coffee'
                        'lib/net.coffee'
                        'lib/trunk.coffee'
                        'lib/random-net.coffee'
                        'lib/main.coffee'
                    ]
        watch:
            coffee:
                files: ['lib/*.coffee']
                tasks: 'coffee'

    grunt.loadNpmTasks('grunt-contrib-coffee')
    grunt.loadNpmTasks('grunt-contrib-watch')
    grunt.registerTask('default', ['coffee'])