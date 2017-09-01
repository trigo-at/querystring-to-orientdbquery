'use strict';

const { expect } = require('chai');
const parse = require('./parse');

/* eslint: padded-blocks: 0 max-len: 0 */
describe('QueryString to OrientDB SQL String tests', () => {
	describe('WHERE filters', () => {
		it('string param=> LIKE value%', async () => {
			const query = {
				name: 'Chuck',
				age: '77',
			};

			const { queryString, queryParameter, countQueryString } = parse(query, 'TestCluster');
			expect(queryString).to.equal('SELECT FROM `TestCluster` WHERE `name` LIKE :nameParam AND `age` LIKE :ageParam SKIP 0 LIMIT 25');

			expect(countQueryString).to.equal('SELECT COUNT(*) FROM `TestCluster` WHERE `name` LIKE :nameParam AND `age` LIKE :ageParam');
			expect(queryParameter).to.eql({
				params: { nameParam: 'Chuck%', ageParam: '77%' },
			});
		});

		it('!string param=> <> value', async () => {
			const query = {
				name: '!Chuck',
			};

			const { queryString, queryParameter, countQueryString } = parse(query, 'TestCluster');
			expect(queryString).to.equal('SELECT FROM `TestCluster` WHERE `name` <> :nameParam SKIP 0 LIMIT 25');
			expect(countQueryString).to.equal('SELECT COUNT(*) FROM `TestCluster` WHERE `name` <> :nameParam');
			expect(queryParameter).to.eql({
				params: { nameParam: 'Chuck' },
			});
		});

		it('number param => exact =value', async () => {
			const query = {
				name: 'Chuck',
				age: 77,
			};

			const { queryString, queryParameter, countQueryString } = parse(query, 'TestCluster');
			expect(queryString).to.equal('SELECT FROM `TestCluster` WHERE `name` LIKE :nameParam AND `age` = :ageParam SKIP 0 LIMIT 25');
			expect(countQueryString).to.equal('SELECT COUNT(*) FROM `TestCluster` WHERE `name` LIKE :nameParam AND `age` = :ageParam');
			expect(queryParameter).to.eql({
				params: { nameParam: 'Chuck%', ageParam: 77 },
			});
		});

		it('array params => IN(value1, value2, ...)', async () => {
			const query = {
				ages: [2, 42, 77],
			};

			const { queryString, queryParameter, countQueryString } = parse(query, 'TestCluster');
			expect(queryString).to.equal('SELECT FROM `TestCluster` WHERE `ages` IN :agesParam SKIP 0 LIMIT 25');
			expect(countQueryString).to.equal('SELECT COUNT(*) FROM `TestCluster` WHERE `ages` IN :agesParam');
			expect(queryParameter).to.eql({
				params: { agesParam: [2, 42, 77] },
			});
		});


		it('handles fields staring with "_" corectly', async () => {
			const query = {
				_name: 'Chuck',
				__age: 77,
				_s_tate: ['draft', 'published'],
			};

			const { queryString, queryParameter, countQueryString } = parse(query, 'TestCluster');
			expect(queryString).to.equal('SELECT FROM `TestCluster` WHERE `_name` LIKE :UNDER_nameParam AND `__age` = :UNDER__ageParam AND `_s_tate` IN :UNDER_s_tateParam SKIP 0 LIMIT 25'); //eslint-disable-line
			expect(countQueryString).to.equal('SELECT COUNT(*) FROM `TestCluster` WHERE `_name` LIKE :UNDER_nameParam AND `__age` = :UNDER__ageParam AND `_s_tate` IN :UNDER_s_tateParam'); //eslint-disable-line

			expect(queryParameter).to.eql({
				params: {
					UNDER_nameParam: 'Chuck%',
					UNDER__ageParam: 77,
					UNDER_s_tateParam: ['draft', 'published'],
				},
			});
		});
	});
});
