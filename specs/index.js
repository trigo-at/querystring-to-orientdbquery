'use strict';

const fs = require('fs');
const path = require('path');
const pkgName = require('../package.json').name;
const log = require('./fake-logger');
const uuid = require('uuid');
const atrixOrientDb = require('@trigo/atrix-orientdb').factory({}, { log },
	{
		server: {
			host: process.env.TEST_ORIENTDB || '127.0.0.1',
			port: 2424,
			username: 'root',
			password: 'password',
		},
		db: {
			name: 'querystring-to-orientdbqueries',
			username: 'root',
			password: 'password',
		},
		migrations: {
			dir: path.join(__dirname, './migrations'),
			runOnStartup: true,
		},
		createDb: true,
	},
);

let db;

function walk(dir) {
	let results = [];
	const list = fs.readdirSync(dir);

	list.forEach((file) => {
		const newFile = `${dir}/${file}`;
		const stat = fs.statSync(newFile);
		if (stat && stat.isDirectory()) {
			results = results.concat(walk(newFile));
		} else {
			results.push(newFile);
		}
	});
	return results;
}

function loadTests() {
	const fileList = walk(path.join(__dirname, '..'))
	.filter(file => file.indexOf('.specs.js') > -1 &&
		file.indexOf('node_modules') === -1 &&
		file.indexOf('coverage') === -1 &&
		file.indexOf('.nyc_output') === -1).forEach((file) => {
		require(file); // eslint-disable-line
		});
	return fileList;
}

const persons = [];

module.exports = {
	db,
	persons,
};

describe(pkgName, async () => {
	try {
		before(async () => {
			module.exports.db = (await atrixOrientDb.start()).db;
			await atrixOrientDb.resetDb();
			await atrixOrientDb.migrateUp();

			// Create some test persons
			persons.push(await module.exports.db.create('VERTEX', 'Person').set({ resId: '1', name: 'Frodo' }).one());
			persons.push(await module.exports.db.create('VERTEX', 'Person').set({ resId: '2', name: 'Sam' }).one());
			persons.push(await module.exports.db.create('VERTEX', 'Person').set({ resId: '3', name: 'Sauron' }).one());
		});

		loadTests();
	} catch (e) {
		console.error(e); //eslint-disable-line
	}
});
