
var buster = require("buster");
var grunt = require("grunt");
var collection = require('../src/collection.js');


buster.testCase('grunt-collection-helper', {

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
    }
});
