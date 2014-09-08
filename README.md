private-bower-mongo-store
=========================

Mongo store for [private-bower](https://github.com/Hacklone/private-bower). Stores package registry in mongo instead of local filesystem.

## Usage
Override the following configuration in your bower.conf.json file (defaults are listed below).

```
"packageStore": "private-bower-mongo-store",
"mongoStore": {
	"connectionString": "mongodb://localhost/bower",
	"collection": "packages"
}
```
