
var buster = require("buster");

buster.testCase('foo', {

    'Collection': {
        setUp: function () {
            console.log('HERE');
        },
        'first': function () {
            assert(true);
        }
    }

});
