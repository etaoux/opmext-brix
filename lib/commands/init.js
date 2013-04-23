var path = require('path');
var fs = require('fs');
var commander = require('commander');
var opm = require('../opm');
var init =  module.extending.exports;

if (!init.options) {
	init.options = {};
}

init.options['--component'] = 'init an component.';

// 存储需要被建立的骨骼文件
init.initFiles = [];

var infoCollectors = {
	// 收集初始化文件信息
	'skeleton_js': function(callback) {
		commander.confirm('include js file? ', function(ok) {
			if (ok) {
				init.initFiles.push('index.js');
			}
			callback();
		});
	},
	'skeleton_css': function(callback) {
		commander.confirm('include css file? ', function(ok) {
			if (ok) {
				init.initFiles.push('index.css');
			}
			callback();
		});
	},
	'skeleton_template': function(callback) {
		commander.confirm('include template file? ', function(ok) {
			if (ok) {
				init.initFiles.push('template.html', 'data.json');
			}
			callback();
		});
	},
};

function getParentPackage(callback) {
	var packageRoot = opm.findPackageRoot(process.cwd());
	opm.getPackage(packageRoot, function(err, package) {
		init.parent = package;
		// TODO 如果package也是component，则报错。暂时缺少判断package是否是component的方法。
		callback(err);
	});
}

function createSkeleton(callback) {
	opm.getPackage(init.root, function(err, package) {
		if (package) {
			package.initFiles(init.initFiles, callback);
		} else {
			callback(err);
		}
	});
}

function createPreviewer(callback) {
	var sourcePath = path.join(__dirname, '../brix/brix-preview.html');
	var targetPath = path.join(init.parent.root, 'brix-preview.html');
	fs.exists(targetPath, function(exists) {
		var source, target;
		if (!exists) {
			source = fs.createReadStream(sourcePath);
			target = fs.createWriteStream(targetPath);
			source.pipe(target);
			source.on('end', function() {
				callback();
			});
		} else {
			callback();
		}
	})
}

var originRun = init.run;
init.run = function(dir, options) {
	if (options.component) {
		// 扩展infoCollector
		Object.keys(infoCollectors).forEach(function(name) {
			var collector = infoCollectors[name];
			init.infoCollectors[name] = collector;
		});
		init.infoDefaults['name'] = function() {
			return init.parent.name + '_' + path.basename(init.root);
		};
		// 扩展任务
		init.tasks['parent_package'] = ['check_inited', getParentPackage];
		init.tasks['collect_info'].unshift('parent_package');
		init.tasks['create_skeleton'] = ['save_package', createSkeleton];
		init.tasks['create_previewer'] = ['save_package', createPreviewer];
	}

	originRun.apply(init, arguments);
};
