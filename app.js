/**
 * BabyWishList Platform : A web application to build cool baby wish lists 
 * Copyright (C) 2012  Bertrand CHEVRIER, KrampStudio
 *  
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see http://www.gnu.org/licenses/agpl-3.0.txt
 * 
 * @author <a href="mailto:chevrier.bertrand@gmail.com">Bertrand Chevrier</a>
 * @license http://www.gnu.org/licenses/agpl-3.0.txt
 * @version 0.2.0
 */

//imports
var express     = require('express'),
    everyauth   = require('everyauth'),
    util        = require('util'),
    properties  = require('./properties'),
    MongoStore  = require('./system/mongostore'),
    UserProvider= require('./providers/user');
    
//initialize the mongodb store
MongoStore.init(properties.store.db);

//getting the user data provider
var userProvier = new UserProvider();

//auth

//how everyauth get a user
everyauth.everymodule.findUserById( function (id, callback) {
    userProvier.getOne(id, callback);
});
everyauth.everymodule.moduleTimeout(10000);

//login using twitter oauth
everyauth.twitter
            .consumerKey(properties.auth.twitter.consumerKey)
            .consumerSecret(properties.auth.twitter.consumerSecret)
            .findOrCreateUser( function (session, accessToken, accessTokenSecret, twitterUserMetadata) {
                var promise = this.Promise();
                var user = {
                    'login'     : twitterUserMetadata.screen_name,
                    'name'      : twitterUserMetadata.name,
                    'twitter'   : {
                        'id' : twitterUserMetadata.id
                    }
                };
                userProvier.save(user, function(err, user){
                     if(err){
                        console.error(err);   
                     }
                     user.id = user._id;
                     promise.fulfill(user);
                });
                return promise;
            })
            .redirectPath('/');

//Create the app instance
var app = express.createServer();

app.configure(function(){
  if(properties.app){
	  for(var key in properties.app){
		app.set(key, properties.app[key]);
	}
  }
  app.register(".html", require("jqtpl").express);
//  app.use(express.logger("tiny"));
  app.use(express.static(__dirname + "/public"));
  app.use(express.bodyParser());
  app.use(express.cookieParser());
  app.use(express.session({secret:properties.store.session.pass}));
  app.use(everyauth.middleware());
  app.use(express.methodOverride());
  app.use(app.router);
  
});



//error configuration
app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});



// Routes
app.get('/', function(req, res){
    console.log(req.user);
	 res.render('index', {
        title: 'BabyWishList'
	 });
 });
 
app.get('/signin', function(req, res){    
     res.render('signin', {
        title: 'BabyWishList'
	 });
 });

//add everyauth view helper
everyauth.helpExpress(app);

//on start
app.listen(
    properties.server.port, 
    properties.server.address
);
console.log("Express server listening %s on port %d in %s mode", properties.server.address, properties.server.port, app.settings.env);