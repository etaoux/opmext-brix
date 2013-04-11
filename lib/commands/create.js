var wrench = require('wrench');
var path = require('path');
var opm = require('../opm');
var fs = require('fs');
var async = require('async');
var mkdirp = require('mkdirp');
var commander = require('commander');
var JSONConfig = require('../opm/Package/configloader/json.js').JSONConfig;

function create(name, options) {
	var packageRoot = opm.findPackageRoot(process.cwd());
	var componentRoot = path.join(packageRoot, 'components', name);
	var parent, config, initFiles = [];

	async.series([
		// 工程库
		function(callback) {
			opm.getPackage(packageRoot, function(err, package) {
				parent = package;
				callback(err);
			});
		},
		// 检测是否已存在同名目录
		function(callback) {
			fs.exists(componentRoot, function(exists) {
				var err;
				if (exists) {
					err = new Error('component already exists.');
				}
				callback(err);
			});
		},
		// 收集名称信息
		function(callback) {
			config = new JSONConfig("{}");

			var defaultValue = parent.name + '_' + name;
			commander.prompt('name(' + defaultValue + '): ', function(input) {
				config.setProperty('name', input || defaultValue);
				callback();
			});
		},
		// 收集版本信息
		function(callback) {
			var defaultValue = '0.0.1';
			commander.prompt('version(' + defaultValue + '): ', function(input) {
				config.setProperty('version', input || defaultValue)
				callback();
			});
		},
		// 描述信息
		function(callback) {
			commander.prompt('description: ', function(input) {
				config.setProperty('description', input);
				callback();
			});
		},
		// 收集初始化文件信息
		function(callback) {
			commander.confirm('include js file? ', function(ok) {
				if (ok) {
					initFiles.push('index.js');
				}
				callback();
			});
		},
		function(callback) {
			commander.confirm('include css file? ', function(ok) {
				if (ok) {
					initFiles.push('index.css');
				}
				callback();
			});
		},
		function(callback) {
			commander.confirm('include template file? ', function(ok) {
				if (ok) {
					initFiles.push('template.html', 'data.json');
				}
				callback();
			});
		},
		// 创建目录
		function(callback) {
			process.stdin.destroy();
			mkdirp(componentRoot, callback);
		},
		// 初始化package.json
		function(callback) {
			config.save(path.join(componentRoot, 'package.json'), callback);
		},
		// 初始化骨骼文件
		function(callback) {
			opm.getPackage(componentRoot, function(err, package) {
				if (package) {
					package.initFiles(initFiles, callback);
				} else {
					callback(err);
				}
			});
		}
	], function(err) {
		if (err) {
			console.error(err);
		} else {
			console.log('component was created in ./' + path.relative(process.cwd(), componentRoot));
		}
	});
}

create.usage = 'create <name>';

create.options = {
	'--extension': 'create an extension for component.'
};

module.exports = create;