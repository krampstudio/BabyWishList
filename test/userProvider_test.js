var conf = require('../config/confLoader').init();
var logger = require('../lib/logFactory').init();
var redisCF = require('../lib/redisClientFactory');
redisCF.init(conf.get('store').redis);

exports.userProviderTest = {
    setUp : function(done){
        this.logins = ['krampstudio', 'jdoe'];
        this.users = [{ 
            fname: "bertrand",
            lname: "chevrier",
            email: "chevrier.bertrand@gmail.com"
        }, {
            fname: "John",
            lname: "Doe",
            email: "jdoe@anonymous.com",
            passwd: "jdoe123"
        }];

        done();
    },

    testProviderStruct : function(test){
        test.expect(5);

        var userProvider = require('../lib/providers/user');

        test.ok(typeof userProvider !== undefined);
        test.ok(typeof userProvider.get  === 'function');
        test.ok(typeof userProvider.save  === 'function');
        test.ok(typeof userProvider.loginExists  === 'function');
        test.ok(typeof userProvider.auth  === 'function');

        test.done();
    },

    testGetUser : function(test){
        test.expect(2);

        var self = this;
        var userProvider = require('../lib/providers/user');
        userProvider.get(this.logins[0], function(err, user){
            test.equal(err, null);
            test.deepEqual(user, self.users[0]);

            test.done();
        });
    },
    
    testLoginExists : function(test){
        test.expect(2);

        var userProvider = require('../lib/providers/user');
        userProvider.loginExists(this.logins[0], function(err, exists){
            test.equal(err, null);
            test.strictEqual(exists, true);

            test.done();
        });
    },

    testLoginNotExists : function(test){
        test.expect(2);

        var userProvider = require('../lib/providers/user');
        userProvider.loginExists('foob', function(err, exists){
            test.equal(err, null);
            test.strictEqual(exists, false);

            test.done();
        });
    },
    
    testSaveUser : function(test){
        test.expect(4);

        var self = this;
        var userProvider = require('../lib/providers/user');

        userProvider.save(this.logins[1], this.users[1], function(err, inserted){
            test.equal(err, null);
            test.ok(inserted === true);

            userProvider.get(self.logins[1], function(err, user){
                test.equal(err, null);
                test.deepEqual(user, self.users[1]);

                test.done();
            });
        });
    },

    testAuth : function(test){
        test.expect(2);
        var self = this;
        var userProvider = require('../lib/providers/user');
        userProvider.auth(this.logins[1], this.users[1].passwd,  function(err, auth){
            test.equal(err, null);
            test.ok(auth === true);
            test.done();
        });
    },

    testAuthWrongPasswd : function(test){
        test.expect(2);
        var self = this;
        var userProvider = require('../lib/providers/user');
        userProvider.auth(this.logins[1], 'bar',  function(err, auth){
            test.equal(err, null);
            test.ok(auth === false);

            test.done();
        });
    },
    
    testDelUser : function(test){
        test.expect(4);

        var self = this;
        var userProvider = require('../lib/providers/user');
        userProvider.get(this.logins[1], function(err, user){
            userProvider.del(self.logins[1], function(err, removed){
                test.equal(err, null);
                test.ok(removed === true);

                userProvider.get(self.logins[1], function(err, user){
                    test.equal(err, null);
                    test.strictEqual(user, null);
                
                    redisCF.exit();

                    test.done();
                });
            });
        });
    }
};
