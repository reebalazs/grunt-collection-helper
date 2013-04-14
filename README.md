
[![Build Status](https://travis-ci.org/reebalazs/grunt-collection-helper.png)](https://travis-ci.org/reebalazs/grunt-collection-helper)


# grunt-collection-helper #

**grunt-collection-helper** is designed to aid the construction of
resource collections from description files. It aims to separate
the description of the list of resources, from their way of usage
from the `Gruntfile.js`.

Simple usage:

    uglify: {
        default: {
            dest: 'dist/full.min.js',
            src: collect.select('full.js')
            )
        }
    }

provided `collection.js` defines a list of resources for `full.js`:

    {
        'full.js': {
            'src/module1.js',
            'src/module2.js',
            'src/sub/module09.js'
        }
    }

The `collection.json` can be provided locally, or originated from
a packae installed by a supported packaging / installation method.


## Goals ##

- provides a way to describe a named collection of resource lists
  in a JSON description file

- provides a simple API usable from a `Gruntfile.js` script,
  to select the list of resources from the above files by their name.

  The resulting resource lists

  * can be freely used, as the collection helper does not support their
    way of usage, it merely provides the lists themselves

  * can be used with any grunt task and file mapping format

- can support multiple packaging / installation methods via its 'locators'
  
  * currently `local()` and `bower()` are implemented


## Installation ##

The package can be installed with npm.

    $ npm install grunt-collection-helper


### Dependency from package.json ###

You may want to automate the installation of this package from the same
way you have installed grunt packages from. Normally, put something like
the following into the `package.json` next to the `Gruntfile.js` where you
want to use the collection helper from:

   "devDependencies": {
        "grunt": ">=0.4",
        ...
        "grunt-collection-helper": "*"
    }


### Development installation ###

With npm:

    $ npm install git://github.com/reebalazs/grunt-collection-helper.git


## How the selection API work ##

Import the package first. (Assumed in all of the following examples.)

    var collect = require('grunt-collection-helper');

Following this you can access the API through the `collect` variable
from an expression.

The API is designed to be very simple: you need to apply a locator first
to specify the root of a package, and then select a collection of resources
(`select(...)`), or
refer to a specific resource relative from within that package
(`path(...)`).

    collect.<LOCATOR>(...).select(str)
    collect.<LOCATOR>(...).path(str)


### The collection.json configuration file ###

As an example, let us create a `collection.json` file in the 
same directory where our
`Gruntfile.js` resides. For example, it could have the following
simple content:

    {
        'flower.js': ['js/rose.js', 'js/bluebell.js'],
        'fruit.css': ['css/apple.css',  'css/orange.css']
    }

This describes the construction order for `flower.js` and `fruit.css` resources.
The resource paths are specified relative from the `collection.json` file.

The file must contain a dictionary in valid JSON format. This dictionary
contains named lists of resource paths. A script then can query for `flower.js`,
and receive the list of the files associated with this name. After this,
the script will process this list according to the way it needs to.


### Locators ###

The resources are always selected relatively to their 'package root',
depending the installation method. The collection helper provides 'locators'
to find the root of a given package. 

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


#### The `local()` locator is the default locator ####

In case the local locator stands without parameters,
it can be omitted.

    collect.select('flower.js')

is equivalent to:

    collect.local().select('flower.js')

and the followings resolve as:

    collect.select('flower.js')
            //=> ['js/rose.js', 'js/bluebell.js']
    collect.select('fruit.css')
            //=> ['css/apple.css',  'css/orange.css']


### The bower locator ###

The following expression finds the source for a given package (in
our example the `boo` package), that has been
installed with `bower`:

    collect.bower('boo').select('boolib.js')

This also assumes that the 'boo' package has a `collection.json`
that defines a list for the key `boolib.js`. In other words, selection
works the same way with each locator, only the initial package
directory is different.

Using of the 'path' method makes it possible to refer to a resource
relative to the bower package root, independently from a
`collection.json` in that package. `path(...)` will always return
a string.

    collect.bower('coo').path('fun/entertainment/discoo.js')
            //=> './components/coo/fun/entertainment/discoo.js'
    collect.bower('coo').path('agriculture/food/coocumber.css')
            //=> './components/coo/agriculture/food/coocumber.css'

The locator will find the 'components' package each time by walking
up to the parent folders, in the above example it was found in the
same directory where `Gruntfile.js` resides.


#### Using main property from bower's component.json ####

In addition to a composition order given in `component.json`,
the `main` property of Bower's `component.json` can also be used.
It will add `main.<EXT>` keys which group the files from `main`
by file extension.

    collect.bower('jquery').select('main.js')

 
    // component.json:                generates into collection.js:
    // 
    // main: 'single.js',        =>   {'main.js': ['single.js']}
    // 
    // main: ['apple.js',        =>   {'main.js': ['apple.js', 'tree/orange.js']}
    //        'tree/orange.js']
    //
    // main: ['apple.js',        =>   {'main.js': ['apple.js', 'tree/orange.js'],
    //        'tree/orange.js',        'main.css': ['cucumber.css']}
    //         'cucumber.css']

The keys in `collection.json` will take precedent: if it already defines
a `main.js`, it will win over the `main` value from `component.json`.


### Other locators ###

It is extendable. We can easily create a `jamjs`, ... locator.

A locator can accept any number of parameters.


## Future plans ##

### Consider settings from .bowerrc in finding the components directory ###

`.bowerrc` provides a way to specify a different `components` directory
for bower to use. We currently ignore this and always use `components`.


### Parametrized selection ###

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
                    collect.select('flower.js'),
                'src/scrumptious/dist/nuts.css':
                    collect.local('src/scrumptious').select('nuts.css')
            }
        }
    },

or (a watch rule where adding the lists is demonstrated. Note that
we used `[].concat(...)`, because lists are not addable with the plus
operator in JavaScript):

    watch: {
        'default': {
            files: [].concat(
                collect.select('flower.js'),
                collect.local('src/scrumptious').select('nuts.css'),
            ),
            tasks: ['concat:default']
        },
    },

or (when we also add files to the collections manually):

    watch: {
        'default': {
            files: [].concat(
                collect.select('flower.js'),
                collect.local('src/scrumptious').select('nuts.css'),
                [
                    collect.bower('jquery').path('jquery.js')
                ]
            ),
            tasks: ['concat:default']
        },
    },

or (an uglify rule, where we use a different src - dest mapping format than previously):

    uglify: {
        default: {
            dest: 'dist/full.min.js',
            src: [].concat(
                collect.select('flower.js'),
                collect.local('src/scrumptious').select('cakes.js'),
                collect.bower('jquery').select('main.js')
            )
        }
    }

## Composition of lists with collection.json ##

XXX
