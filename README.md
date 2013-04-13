
[![Build Status](https://travis-ci.org/reebalazs/grunt-collection-helper.png)](https://travis-ci.org/reebalazs/grunt-collection-helper)


# grunt-collection-helper #

XXX What is it?


## Installation ##

XXX How to install it?


## How selection expressions work ##

Import the package first. (Assumed in all of the following examples.)

    var collect = require('grunt-collection-helper');


### The collection.json configuration file ###

Consider I have a local `collection.json` in the same directory where 
`Gruntfile.js` resides, with the following content:

    {
        'flower.js': ['js/rose.js', 'js/bluebell.js'],
        'fruit.css': ['css/apple.css',  'css/orange.css']
    }

This describes the construction order for `flower.js` and `fruit.css` resources.
The resource paths are specified relative from the `collection.json` file.


### The local() locator ###

The following expressions will select the construction order for the specified resource:

    collect.local().select('flower.js')
            //=> ['js/rose.js', 'js/bluebell.js']
    collect.local().select('fruit.css')
            //=> ['css/apple.css',  'css/orange.css']

A path parameter can be specified to `local`, where a `collection.json` file
will be read from. For example, `src/scrumptious/collection.json` could contain:

    {
        'cakes.js': ['js/dobos.js', 'js/tiramisu.js'],
        'nuts.css': ['css/almond.css',  'css/chestnut.css']
    }

This would make the following expressions work:

    collect.local('src/scrumptious').select('cakes.js')  
            //=> ['js/dobos.js', 'js/tiramisu.js']
    collect.local('src/scrumptious').select('nuts.css')
            //=> ['css/almond.css',  'chestnut.css']


### The bower locator ###

The following expression finds the source for a given package (in
our example the `boo` package), that has been
installed with `bower`:

    collect.bower('boo').select('boolib.js')

In addition to a composition order given in `component.json`,
the `main` property of Bower's `component.json` can also be used:

    collect.bower('jquery').select('jquery.js')

XXX consider removing this, and demonstrate the ability of a locator
to import this information from an existing configuration with a
different data format.


### Other locators ###

It is extendable. We can easily create a `jamjs`, ... locator.


### Future: parametrized selection ###

At some time later in the future, a more flexible way of
parametrizing the selection could also be supported:

    collect.bower('foo').select({'features': ['drag', 'drop']})
        // uses a function from collection.js


## Using the expressions from the Gruntfile.js ##

As the select function returns just normal arrays, it can be used with any
grunt plugin, and in various combinations, from `Gruntfile.js`. Consider the
following examples:

    concat: {
        'default': {
            files: {
                'dist/flower.js':
                    collect.local().select('flower.js'),
                'src/scrumptious/dist/nuts.css':
                    collect.local('src/scrumptious').select('nuts.css')
            }
        }
    },

or (a watch rule where adding the lists is demonstrated):

    watch: {
        'default': {
            files:
                collect.local().select('flower.js') +
                collect.local('src/scrumptious').select('nuts.css'),
            tasks: ['concat:default']
        },
    },

or (an uglify rule, where we use a different src - dest mapping format than previously):

    uglify: {
        default: {
            dest: 'dist/full.min.js',
            src: collect.local().select('flower.js') +
                    collect.local('src/scrumptious').select('cakes.js')
        }
    }
