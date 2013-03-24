
var path = require('path');
var grunt = require('grunt');
var util = require('util');

function Collection(base) {
    this.base = base;
    this.jsonPath = path.join(base, 'collection.json');
    this.config = grunt.file.readJSON(this.jsonPath);
}
Collection.prototype = {
    constructor: Collection,

    select: function(key) {
        if (typeof key === 'string') {
            var config = this.config[key];
            if (config === undefined) {
                throw new Error('Bad config, no such key "' + key +
                    '" in file "' + this.jsonPath + '".');
            }
            if (! Array.isArray(config)) {
                throw new Error('Bad config, value must be an array for key "' + key +
                    '" in file "' + this.jsonPath + '".');
            }
            // paths relative from json file path
            var result = [];
            for (var i = 0; i < config.length; i++) {
                result.push(path.join(this.base, config[i]));
            }
            return result;
        } else {
            throw new Error('Not yet supported.');
        }
    }

};


function BaseLocator() {
    var base = this.getBase.apply(this, arguments);
    this.collection = new this.Collection(base);
}
BaseLocator.prototype = {
    constructor: BaseLocator,
    Collection: Collection,

    select: function(key) {
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


function BowerLocator() {
    BowerLocator.super_.apply(this, arguments);
}
util.inherits(BowerLocator, BaseLocator);
BowerLocator.prototype.constructor = BowerLocator;

BowerLocator.prototype.getBase = function(pkgName) {
    // Bower's packages are under components/${pkgName}
    var base = path.join('components', pkgName);
    return base;
};


module.exports = {

    name: 'grunt-collection-helper',

    local: function (/*optional*/ base) {
        return new LocalLocator(base);
    },

    bower: function (pkgName) {
        return new BowerLocator(pkgName);
    }

};
