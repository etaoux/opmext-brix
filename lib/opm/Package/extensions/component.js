var Package = require('../../Package');
var path = require('path');
var async = require('async');
var fs = require('fs');
var mustache = require('mustache');

/**
 * 生成新库的初始文件
 * @param files 生成哪些文件，比如 index.js template.html
 */
function initFiles(files, callback) {
	var package = this;
	var skeletonPath = path.join(__dirname, '../../brix/skeleton');

	async.forEach(files, function(file, callback) {
		var template; // 存储读取的模版文本
		async.series([
			// 读模版文件
			function(callback) {
				var templateFile = path.join(skeletonPath, file + '.mustache');
				fs.readFile(templateFile, 'utf-8', function(err, text) {
					template = text;
					callback(err);
				});
			},
			// 写生成文件
			function(callback) {
				var resultFile = path.join(package.root, file);
				var result = mustache.render(template, {
					namespace: package.namespace,
					name: package.name,
					subname: package.subname
				});
				fs.writeFile(resultFile, result, 'utf-8', callback);
			}
		], callback);
	}, callback);
};

exports.wrap = function(package) {
	package.initFiles = initFiles;
};