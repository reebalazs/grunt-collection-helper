
var path = require('path');
var grunt = require('grunt');
var util = require('util');
var extend = require('whet.extend');

function Collection(base) {
    this.base = base;
    this.config = {};
    this._makeConfig();
}
Collection.prototype = {
    constructor: Collection,

    _makeConfig: function() {
        var jsonPath = this.path('collection.json');
        var config = {};
        try {
            config = grunt.file.readJSON(jsonPath);
        } catch (e) {
            // XXX ... it looks like verbose never gets logged, not even with -v
            grunt.verbose.writeln('Info: Could not read "' + jsonPath + '"');
        }
        extend(this.config, config);
    },

    path: function(splitPath) {
        if (splitPath === undefined) {
            splitPath = ['.'];
        } else if (! Array.isArray(splitPath)) {
            splitPath = [splitPath];
        }
        if (splitPath.length > 1) {
            // switch to a different component,
            // if path was in format locator:parm1[:...]:filepath
            var target = module.exports[splitPath[0]].apply(module.exports,
                splitPath.slice(1, -1));
            return target.path(splitPath[splitPath.length - 1]);
        } else {
            return path.join(this.base, splitPath[0]);
        }
    },

    select: function(key) {
        if (typeof key === 'string') {
            var config = this.config[key];
            if (config === undefined) {
                throw new Error('Bad config, no such key "' + key +
                    '" in configuration.');
            }
            if (! Array.isArray(config)) {
                throw new Error('Bad config, value must be an array for key "' + key +
                    '" in configuration.');
            }
            // paths relative from json file path
            var result = [];
            for (var i = 0; i < config.length; i++) {
                result.push(this.path(config[i]));
            }
            return result;
        } else {
            throw new Error('Not yet supported.');
        }
    }

};


function BaseLocator() {
    this.base = this.getBase.apply(this, arguments);
    this.collection = new this.Collection(this.base);
}
BaseLocator.prototype = {
    constructor: BaseLocator,
    Collection: Collection,

    path: function() {
        return this.collection.path.apply(this.collection, arguments);
    },

    select: function() {
        return this.collection.select.apply(this.collection, arguments);
    }

};


function LocalLocator() {
    LocalLocator.super_.apply(this, arguments);
}
util.inherits(LocalLocator, BaseLocator);
LocalLocator.prototype.constructor = LocalLocator;

LocalLocator.prototype.getBase = function(/*optional*/ base) {
    // base parameter specifies the root location, place of collection.json
    if (base === undefined) {
        // grunt makes sure that we are cwd to the gruntfile's location,
        // this will make everything relative to the gruntfile.
        base = '.';
    }
    return base;
};


function BowerCollection() {
    BowerCollection.super_.apply(this, arguments);
}
util.inherits(BowerCollection, Collection);
BowerCollection.prototype.constructor = BowerCollection;

BowerCollection.prototype._makeConfig = function() {
    // First apply the 'main' attribute from bower's component.json.
    this._makeBowerConfig();
    // Then, apply defaults from collection.js, taking a precedent
    BowerCollection.super_.prototype._makeConfig.apply(this);
};

BowerCollection.prototype._makeBowerConfig = function() {
    //
    // The main option in component.json will be used
    // as single additional resources
    // 
    // e.g.
    // 
    // component.json:                generates into collection.js:
    // 
    // main: 'single.js',        =>   {'single.js': ['single.js']}
    // 
    // main: ['apple.js',        =>   {'apple.js': ['apple.js'],
    //       'tree/orange.js'],       'orange.js': ['tree/orange.js']}
    //
    //
    var jsonPath = this.path('component.json');
    var config = grunt.file.readJSON(jsonPath);
    var main = config.main || [];
    if (typeof main == 'string') {
        main = [main];
    }
    for (var i = 0; i < main.length; i++) {
        var full = main[i];
        var base = path.basename(full);
        this.config[base] = [full];
    }
};

function BowerLocator() {
    BowerLocator.super_.apply(this, arguments);
}
util.inherits(BowerLocator, BaseLocator);
BowerLocator.prototype.constructor = BowerLocator;
BowerLocator.prototype.Collection = BowerCollection;

BowerLocator.prototype.getBase = function(pkgName) {
    // Bower's packages are under components/${pkgName}
    var base = path.join('components', pkgName);
    return base;
};


module.exports = {

    name: 'grunt-collection-helper',

    _cache: {local: {}, bower: {}},

    select: function () {
        var locator = this.local();
        return locator.select.apply(locator, arguments);
    },

    local: function (/*optional*/ base) {
        var key = base || '.';
        var result = this._cache.local[key] =
            this._cache.local[key] || new LocalLocator(base);
        return result;
    },

    bower: function (pkgName) {
        var result = this._cache.bower[pkgName] =
            this._cache.bower[pkgName] || new BowerLocator(pkgName);
        return result;
    }

};
