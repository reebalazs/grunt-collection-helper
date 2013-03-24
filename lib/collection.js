
var path = require('path');
var grunt = require('grunt');

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


module.exports = {

    name: 'buster-qunit',

    local: function (/*optional*/ base) {
        // base parameter specifies the root location, place of collection.json
        if (base === undefined) {
            // grunt makes sure that we are cwd to the gruntfile's location,
            // this will make everything relative to the gruntfile.
            base = '.';
        }
        return new Collection(base);
    },

    bower: function (pkgName) {
        // Bower's packages are under components/${pkgName}
        var base = path.join('components', pkgname);
        return new Collection(base);
    }

};
