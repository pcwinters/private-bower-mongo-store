connectOnce = require 'connect-once'
_ = require 'lodash'
MongoClient = require('mongodb').MongoClient

module.exports = class MongoStore
	@defaults =
		mongoStore:
			connectionString: 'mongodb://localhost/bower'
			collection: 'packages'

	constructor: (@config)->
		@config = _.merge MongoStore.defaults, @config

	init: ()=>
		@connection = new connectOnce({}, MongoClient.connect, @config.mongoStore.connectionString)

	packages: (callback)=>
		@_collection (err, collection)=>
			if err? then return callback(err)
			collection.find({}).toArray(callback)

	getPackage: (name, callback)=>
		@_collection (err, collection)=>
			if err? then return callback(err)
			collection.findOne({name: name}, callback)

	registerPackages: (thePackage, callback)=>
		@_collection (err, collection)=>
			if err? then return callback(err)
			collection.insert(thePackage, callback)

	removePackages: (packages, callback)=>
		@_collection (err, collection)=>
			if err? then return callback(err)
			namesToRemove = _(packages).pluck('name').filter(_.identity).value()
			query =
				name:
					$in: namesToRemove
			collection.remove(query, callback)

	searchPackage: (name, callback)=>
		@_collection (err, collection)=>
			if err? then return callback(err)
			escaped = @_escape(name)
			query =
				name:
					$regex: new RegExp(".*#{escaped}.*")
			collection.find(query).toArray(callback)

	updatePackage: (thePackage, callback)=>
		@_collection (err, collection)=>
			if err? then return callback(err)
			query = {name: thePackage.name}
			collection.update(query, thePackage, callback)

	_escape: (string)->
		return string.replace(/[-\\^$*+?.()|[\]{}]/g, "\\$&")

	_collection: (callback)=>
		@connection.when 'available', (err, db)=>
			if err? then return callback(err)
			callback(null, db.collection(@config.mongoStore.collection))
