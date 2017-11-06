'use strict';

module.exports = {
	name: 'Person Entity',
	up: async (db) => {
		const PersonEntity = await db.class.create('Person', 'V');

		await PersonEntity.property.create([
			{ name: 'resId', type: 'String' },
		]);

		await db.index.create({
			name: 'Person.resId',
			type: 'UNIQUE_HASH_INDEX',
		});
	},
	down: db => db.class.drop('Person'),
};
