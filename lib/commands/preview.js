var fs = require('fs');
var path = require('path');
var async = require('async');
var opm = require('../opm');
var connect = require('connect');
var http = require('http');

function preview(options) {

	var root = opm.findPackageRoot(process.cwd());
	var parentRoot = opm.findPackageRoot(path.join(root, '../'));
	var componentPackage, parent;

	async.auto({
		'get_package': function(callback) {
			opm.getPackage(root, function(err, package) {
				componentPackage = package;
				callback(err);
			});
		},
		'get_parent': function(callback) {
			opm.getPackage(parentRoot, function(err, package) {
				parent = package;
				callback(err);
			});
		},
		'check_previewer': ['get_parent', function(callback) {
			fs.exists(path.join(parent.root, 'brix-preview.html'), function(exists) {
				var err;
				if (!exists) {
					err = new Error('brix-preview.html not found.');
				}
				callback(err);
			});
		}],
		'create_server': ['get_package', function(callback) {
			var app = connect();
			app.use(connect.static(parent.root));
			app.use(connect.directory(parent.root));
			
			http.createServer(app).listen(3000);
			callback();
		}],
		'open_browser': ['get_package', 'check_previewer', 'create_server', function(callback) {
			var url = 'http://localhost:3000/brix-preview.html?' + componentPackage.subname;
			var spawn = require('child_process').spawn;
			spawn('open', [url]);
			callback();
		}]
	});

}

preview.usage = 'preview';

preview.options = {
};

module.exports = preview;