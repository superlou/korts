module.exports = (grunt)->
    grunt.initConfig
        pkg: grunt.file.readJSON('package.json')
        coffee:
            compile:
                options:
                    join: true
                files:
                    'client/build/main.js': [
                        'common/src/utils.coffee'
                        'common/src/dumb-store.coffee'
                        'common/src/device.coffee'
                        'common/src/route.coffee'
                        'common/src/net.coffee'
                        'common/src/trunk.coffee'
                        'common/src/random-net.coffee'
                        'client/src/main.coffee'
                    ]
                    'server/build/server.js': [
                        'server/src/requires.coffee'
                        'common/src/utils.coffee'
                        'common/src/dumb-store.coffee'
                        'common/src/device.coffee'
                        'common/src/route.coffee'
                        'common/src/net.coffee'
                        'common/src/trunk.coffee'
                        'common/src/random-net.coffee'
                        'server/src/server.coffee'
                    ]
        watch:
            coffee:
                files: [
                    'client/src/*.coffee'
                    'common/src/*.coffee'
                    'server/src/*.coffee'
                ]
                tasks: 'coffee'

        nodemon:
            dev:
                options: 
                    file: 'server/build/server.js'
                    env:
                        PORT: '8000'

        concurrent:
            dev: 
                tasks: ['watch', 'nodemon:dev']
                options:
                    logConcurrentOutput: true


    grunt.loadNpmTasks('grunt-contrib-coffee')
    grunt.loadNpmTasks('grunt-contrib-watch')
    grunt.loadNpmTasks('grunt-execute')
    grunt.loadNpmTasks('grunt-concurrent')
    grunt.loadNpmTasks('grunt-nodemon')

    grunt.registerTask('default', ['coffee'])
    grunt.registerTask('dev', ['concurrent:dev'])