var init = require('./init');
var path = require('path');
var opm = require('../opm');

/**
 * 通过 init 命令创建一个组件库，会自动识别components目录，其余同init功能一样。
 */
function create(name, options) {
	var packageRoot = opm.findPackageRoot(process.cwd());
	var root = path.join(packageRoot, 'components', name);
	if (!packageRoot) {
		console.error('not in a package.');
	} else {
		options['component'] = true;
		init.run(root, options);
	}
}

create.usage = 'create <name>';

module.exports = create;