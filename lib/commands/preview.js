var fs = require('fs');
var path = require('path');
var async = require('async');
var opm = require('../opm');

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
		'open_browser': ['get_package', 'check_previewer', function(callback) {
			var url = options.server + '/brix-preview.html?' + componentPackage.subname;
			var spawn = require('child_process').spawn;
			spawn('open', [url]);
			callback();
		}]
	});

}

preview.usage = 'preview';

preview.options = {
	'--server <server_prefix>': ['server prefix', 'http://localhost']
};

module.exports = preview;