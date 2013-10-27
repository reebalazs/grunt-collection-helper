
var buster = require("buster");
var grunt = require("grunt");
var collection = require('../src/collection.js');


buster.testCase('grunt-collection-helper', {

    setUp: function () {
        collection._cache = {local: {}, bower: {}};
    },

    'Collection': {
        setUp: function () {
            this.mockFile = this.mock(grunt.file);
        },
        'sets up': {
            'without parameter': function () {
                this.mockFile.expects('readJSON')
                    .withArgs('collection.json');
                var c = collection.local().collection;
                assert.equals(c.base, '.');
            },
            'with parameter': function () {
                this.mockFile.expects('readJSON')
                    .withArgs('foo/collection.json');
                var c = collection.local('foo').collection;
                assert.equals(c.base, 'foo');
            }
        },
        'reads configuration': {
            'from file': function () {
                var config1 = {
                    'a.js': ['a1.js', 'a2.js'],
                    'b.js': ['b1.js', 'b2.js']
                };
                this.mockFile.expects('readJSON')
                    .returns(config1);
                var c = collection.local().collection;
                assert.equals(c.base, '.');
                assert.equals(c.config, config1);
            },
            ', ignores non-existent file': function () {
                this.mockFile.expects('readJSON')
                    .throws();
                var c = collection.local().collection;
                assert.equals(c.base, '.');
                assert.equals(c.config, {});
            }
        },
        'path': function () {
            this.mockFile.expects('readJSON')
                .atLeast(1);
            assert.equals(collection.local().collection.path(),
                '.');
            assert.equals(collection.local().collection.path('foo.js'),
                'foo.js');
            assert.equals(collection.local().collection.path('some/foo.js'),
                'some/foo.js');
            assert.equals(collection.local('bar/camp').collection.path('foo.js'),
                'bar/camp/foo.js');
            assert.equals(collection.local('bar/camp').collection.path('some/foo.js'),
                'bar/camp/some/foo.js');
        },
        'select': {
            'setUp': function () {
                 var config1 = {
                    'a.js': ['a1.js', 'a2.js'],
                    'b.js': ['b1.js', 'b2.js'],
                    'wrong': 'NOTANARRAY'
                };
                this.mockFile.expects('readJSON')
                    .returns(config1);
                this.c = collection.local().collection;
            },
            'finds key': function () {
                assert.equals(this.c.select('a.js'), ['a1.js', 'a2.js']);
                assert.equals(this.c.select('b.js'), ['b1.js', 'b2.js']);
            },
            'nonexistent key yields error': function () {
                var c = this.c;
                assert.exception(function () {
                    c.select('NOSUCH');
                }, 'Error');
            },
            'non-list value yields error': function () {
                var c = this.c;
                assert.exception(function () {
                    c.select('wrong');
                }, 'Error');
            },
            'non-string key yields error': function () {
                // This feature will be implemented at some point.
                var c = this.c;
                assert.exception(function () {
                    c.select({features: ['foo', 'bar']});
                }, 'Error');
            }
        }
    },

    'local': {
        'is cached': function () {
            var mockFile = this.mock(grunt.file);
            mockFile.expects('readJSON').exactly(3);
            var c1 = collection.local();
            var c2 = collection.local();
            assert.same(c1, c2);
            var c3 = collection.local('foo');
            var c4 = collection.local('foo');
            assert.same(c3, c4);
            refute.same(c1, c3);
            var c5 = collection.local('bar');
            var c6 = collection.local('bar');
            assert.same(c5, c6);
            refute.same(c1, c5);
            refute.same(c3, c5);
        },

        'collection.json is optional': function () {
            var mockFile = this.mock(grunt.file);
            mockFile.expects('exists')
                .withArgs('.').returns(true);
            mockFile.expects('exists')
                .withArgs('bower_components').returns(true);
            mockFile.expects('readJSON')
                .withArgs('bower_components/foo/bower.json').returns({});
            mockFile.expects('readJSON')
                .withArgs('bower_components/foo/collection.json').throws();
            //
            var c1 = collection.bower('foo');
        },

        'component.json + bower.json is optional too': function () {
            var mockFile = this.mock(grunt.file);
            mockFile.expects('exists')
                .withArgs('.').returns(true);
            mockFile.expects('exists')
                .withArgs('bower_components').returns(true);
            mockFile.expects('readJSON')
                .withArgs('bower_components/foo/component.json').throws();
            mockFile.expects('readJSON')
                .withArgs('bower_components/foo/bower.json').throws();
            mockFile.expects('readJSON')
                .withArgs('bower_components/foo/collection.json').throws();
            //
            var c1 = collection.bower('foo');
        }


    },

    'bower': {
        'is cached': function () {
            var mockFile = this.mock(grunt.file);
            mockFile.expects('readJSON')
                .withArgs('bower_components/foo/bower.json').returns({});
            mockFile.expects('readJSON')
                .withArgs('bower_components/foo/collection.json');
            mockFile.expects('readJSON')
                .withArgs('bower_components/bar/bower.json').returns({});
            mockFile.expects('readJSON')
                .withArgs('bower_components/bar/collection.json');
            mockFile.expects('readJSON')
                .withArgs('foo/collection.json');
            mockFile.expects('exists')
                .withArgs('.').returns(true);
            mockFile.expects('exists')
                .withArgs('bower_components').returns(true); // location is only checked once (cached)
            var c1 = collection.bower('foo');
            var c2 = collection.bower('foo');
            assert.same(c1, c2);
            var c3 = collection.bower('bar');
            var c4 = collection.bower('bar');
            assert.same(c3, c4);
            refute.same(c1, c3);
            var c5 = collection.local('foo');
            refute.same(c1, c5);
        },

        'walks up on directory tree': function () {
            var mockFile = this.mock(grunt.file);
            mockFile.expects('exists')
                .withArgs('.').returns(true);
            mockFile.expects('exists')
                .withArgs('bower_components').returns(false); // no
            mockFile.expects('exists')
                .withArgs('components').returns(false); // no
            mockFile.expects('exists')
                .withArgs('..').returns(true);
            mockFile.expects('exists')
                .withArgs('../bower_components').returns(false); // no
            mockFile.expects('exists')
                .withArgs('../components').returns(false); // no
            mockFile.expects('exists')
                .withArgs('../..').returns(true);
            mockFile.expects('exists')
                .withArgs('../../bower_components').returns(true); // yes, found
            // now expect to read the package config
            var config1 = {'a.js': ['a1.js', 'a2.js']};
            mockFile.expects('readJSON')
                .withArgs('../../bower_components/foo/collection.json').returns(config1);
            mockFile.expects('readJSON')
                .withArgs('../../bower_components/foo/bower.json').returns({});
            //
            var c1 = collection.bower('foo');
            assert.equals(c1.base, '../../bower_components/foo');
            assert.equals(c1.collection.config, config1);
        },

        'stops at the top of the tree, error if bower_components are not found at all': function () {
            var mockFile = this.mock(grunt.file);
            mockFile.expects('exists')
                .withArgs('.').returns(true);
            mockFile.expects('exists')
                .withArgs('bower_components').returns(false); // no
            mockFile.expects('exists')
                .withArgs('components').returns(false); // no
            mockFile.expects('exists')
                .withArgs('..').returns(true);
            mockFile.expects('exists')
                .withArgs('../bower_components').returns(false); // no
            mockFile.expects('exists')
                .withArgs('../components').returns(false); // no
            mockFile.expects('exists')
                .withArgs('../..').throws();
            //
            assert.exception(function () {
                collection.bower('foo');
            }, 'Error');
        },

        'does not give error if bower.json does not exist in package root': function () {
            var mockFile = this.mock(grunt.file);
            mockFile.expects('exists')
                .withArgs('.').returns(true);
            mockFile.expects('exists')
                .withArgs('bower_components').returns(true);
            mockFile.expects('readJSON')
                .withArgs('bower_components/foo/bower.json').throws();
            mockFile.expects('readJSON')
                .withArgs('bower_components/foo/component.json').throws();
            mockFile.expects('readJSON')
                .withArgs('bower_components/foo/collection.json').throws();
            //
            collection.bower('foo');

        },

        'collection.json is optional': function () {
            var mockFile = this.mock(grunt.file);
            mockFile.expects('exists')
                .withArgs('.').returns(true);
            mockFile.expects('exists')
                .withArgs('bower_components').returns(true);
            mockFile.expects('readJSON')
                .withArgs('bower_components/foo/bower.json').returns({});
            mockFile.expects('readJSON')
                .withArgs('bower_components/foo/collection.json').throws();
            //
            var c1 = collection.bower('foo');
        },

        'merges main attribute from bower.json': function () {
            var mockFile = this.mock(grunt.file);
            mockFile.expects('exists')
                .withArgs('.').returns(true);
            mockFile.expects('exists')
                .withArgs('bower_components').returns(true);
            mockFile.expects('readJSON')
                .withArgs('bower_components/foo/bower.json')
                .returns({main: ['a1.js', 'a2.js',
                        'c1.css', 'c2.css', 'm.less']});
            mockFile.expects('readJSON')
                .withArgs('bower_components/foo/collection.json').returns({
                    'x.js': ['x1.js', 'x2.js']
                });
            //
            var c1 = collection.bower('foo');
            assert.equals(c1.collection.config, {
                 'x.js': ['x1.js', 'x2.js'],
                'main.js': ['a1.js', 'a2.js'],
                'main.css': ['c1.css', 'c2.css'],
                'main.less': ['m.less']
            });
        },

       'attributes from components.json take precedent over main': function () {
            var mockFile = this.mock(grunt.file);
            mockFile.expects('exists')
                .withArgs('.').returns(true);
            mockFile.expects('exists')
                .withArgs('bower_components').returns(true);
            mockFile.expects('readJSON')
                .withArgs('bower_components/foo/bower.json')
                .returns({main: ['a1.js', 'a2.js',
                        'c1.css', 'c2.css', 'm.less']});
            mockFile.expects('readJSON')
                .withArgs('bower_components/foo/collection.json').returns({
                    'x.js': ['x1.js', 'x2.js'],
                    'main.css': ['somethingelse.css']
                });
            //
            var c1 = collection.bower('foo');
            assert.equals(c1.collection.config, {
                 'x.js': ['x1.js', 'x2.js'],
                'main.js': ['a1.js', 'a2.js'],
                'main.css': ['somethingelse.css'],   // <=
                'main.less': ['m.less']
            });
        }
    }

});
