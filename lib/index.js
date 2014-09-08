(function() {
  var MongoClient, MongoStore, connectOnce, _,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  connectOnce = require('connect-once');

  _ = require('lodash');

  MongoClient = require('mongodb').MongoClient;

  module.exports = MongoStore = (function() {
    MongoStore.defaults = {
      mongoStore: {
        connectionString: 'mongodb://localhost/bower',
        collection: 'packages'
      }
    };

    function MongoStore(config) {
      this.config = config;
      this._collection = __bind(this._collection, this);
      this.updatePackage = __bind(this.updatePackage, this);
      this.searchPackage = __bind(this.searchPackage, this);
      this.removePackages = __bind(this.removePackages, this);
      this.registerPackages = __bind(this.registerPackages, this);
      this.getPackage = __bind(this.getPackage, this);
      this.packages = __bind(this.packages, this);
      this.init = __bind(this.init, this);
      this.config = _.merge(MongoStore.defaults, this.config);
    }

    MongoStore.prototype.init = function() {
      return this.connection = new connectOnce({}, MongoClient.connect, this.config.mongoStore.connectionString);
    };

    MongoStore.prototype.packages = function(callback) {
      var _this = this;
      return this._collection(function(err, collection) {
        if (err != null) {
          return callback(err);
        }
        return collection.find({}).toArray(callback);
      });
    };

    MongoStore.prototype.getPackage = function(name, callback) {
      var _this = this;
      return this._collection(function(err, collection) {
        if (err != null) {
          return callback(err);
        }
        return collection.findOne({
          name: name
        }, callback);
      });
    };

    MongoStore.prototype.registerPackages = function(thePackage, callback) {
      var _this = this;
      return this._collection(function(err, collection) {
        if (err != null) {
          return callback(err);
        }
        return collection.insert(thePackage, callback);
      });
    };

    MongoStore.prototype.removePackages = function(packages, callback) {
      var _this = this;
      return this._collection(function(err, collection) {
        var namesToRemove, query;
        if (err != null) {
          return callback(err);
        }
        namesToRemove = _(packages).pluck('name').filter(_.identity).value();
        query = {
          name: {
            $in: namesToRemove
          }
        };
        return collection.remove(query, callback);
      });
    };

    MongoStore.prototype.searchPackage = function(name, callback) {
      var _this = this;
      return this._collection(function(err, collection) {
        var escaped, query;
        if (err != null) {
          return callback(err);
        }
        escaped = _this._escape(name);
        query = {
          name: {
            $regex: new RegExp(".*" + escaped + ".*")
          }
        };
        return collection.find(query).toArray(callback);
      });
    };

    MongoStore.prototype.updatePackage = function(thePackage, callback) {
      var _this = this;
      return this._collection(function(err, collection) {
        var query;
        if (err != null) {
          return callback(err);
        }
        query = {
          name: thePackage.name
        };
        return collection.update(query, thePackage, callback);
      });
    };

    MongoStore.prototype._escape = function(string) {
      return string.replace(/[-\\^$*+?.()|[\]{}]/g, "\\$&");
    };

    MongoStore.prototype._collection = function(callback) {
      var _this = this;
      return this.connection.when('available', function(err, db) {
        if (err != null) {
          return callback(err);
        }
        return callback(null, db.collection(_this.config.mongoStore.collection));
      });
    };

    return MongoStore;

  })();

}).call(this);
