var conf = require('../config/confLoader').init();
var logger = require('../lib/logFactory').init();

exports.userProviderTest = {

    setUp : function(done){
        done();
    },

    testAws : function(test){
      var awsProvider = require('../lib/providers/aws');

        awsProvider.search('Elric des dragons', 'All', function(err, result){
            test.strictEqual(err, null);
            test.ok(result.total > 0);
            test.ok(result.pages > 0);
            test.ok(result.items.length > 0);
            test.ok(result.items[0].asin !== undefined);
            test.ok(result.items[0].url !== undefined);
            test.done();
        });
    }
};
