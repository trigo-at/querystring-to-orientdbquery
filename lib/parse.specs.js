'use strict';

const { expect } = require('chai');
const parse = require('./parse');
const testCtx = require('../specs');

/* eslint: padded-blocks: 0 max-len: 0 */
describe('QueryString to OrientDB SQL String tests', () => {
	describe('WHERE filters', () => {
		it('string param=> LIKE value%', async () => {
			const query = {
				name: 'Chuck',
				age: '77',
			};

			const { queryString, queryParameter, countQueryString } = parse(query, 'TestCluster');
			expect(queryString).to.equal('SELECT FROM `TestCluster` WHERE `name`.toLowerCase() LIKE :nameParam AND `age`.toLowerCase() LIKE :ageParam SKIP 0 LIMIT 25');

			expect(countQueryString).to.equal('SELECT COUNT(*) FROM `TestCluster` WHERE `name`.toLowerCase() LIKE :nameParam AND `age`.toLowerCase() LIKE :ageParam');
			expect(queryParameter).to.eql({
				params: { nameParam: '%chuck%', ageParam: '%77%' },
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
			expect(queryString).to.equal('SELECT FROM `TestCluster` WHERE `name`.toLowerCase() LIKE :nameParam AND `age` = :ageParam SKIP 0 LIMIT 25');
			expect(countQueryString).to.equal('SELECT COUNT(*) FROM `TestCluster` WHERE `name`.toLowerCase() LIKE :nameParam AND `age` = :ageParam');
			expect(queryParameter).to.eql({
				params: { nameParam: '%chuck%', ageParam: 77 },
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
			expect(queryString).to.equal('SELECT FROM `TestCluster` WHERE `_name`.toLowerCase() LIKE :UNDER_nameParam AND `__age` = :UNDER__ageParam AND `_s_tate` IN :UNDER_s_tateParam SKIP 0 LIMIT 25'); //eslint-disable-line
			expect(countQueryString).to.equal('SELECT COUNT(*) FROM `TestCluster` WHERE `_name`.toLowerCase() LIKE :UNDER_nameParam AND `__age` = :UNDER__ageParam AND `_s_tate` IN :UNDER_s_tateParam'); //eslint-disable-line

			expect(queryParameter).to.eql({
				params: {
					UNDER_nameParam: '%chuck%',
					UNDER__ageParam: 77,
					UNDER_s_tateParam: ['draft', 'published'],
				},
			});
		});

		it('shall properly handle case insensitive LIKE clauses with full matches', async () => {
			const query = { name: 'Frodo' };
			const { queryString, queryParameter } = parse(query, 'Person');
			const res = await testCtx.db.query(queryString, queryParameter);
			expect(res.length).to.equal(1);
			expect(res[0].name).to.equal('Frodo');
		});

		it('shall properly handle case insensitive LIKE clauses with partial matches (front)', async () => {
			const query = { name: 'Fr' };
			const { queryString, queryParameter } = parse(query, 'Person');
			const res = await testCtx.db.query(queryString, queryParameter);
			expect(res.length).to.equal(1);
			expect(res[0].name).to.equal('Frodo');
		});

		it('shall properly handle case insensitive LIKE clauses with partial matches (mid)', async () => {
			const query = { name: 'odo' };
			const { queryString, queryParameter } = parse(query, 'Person');
			const res = await testCtx.db.query(queryString, queryParameter);
			expect(res.length).to.equal(1);
			expect(res[0].name).to.equal('Frodo');
		});

		it('shall properly handle case insensitive LIKE clauses with partial matches (multiple)', async () => {
			const query = { name: 'Sa' };
			const { queryString, queryParameter } = parse(query, 'Person');
			const res = await testCtx.db.query(queryString, queryParameter);
			expect(res.length).to.equal(2);
			expect(res[0].name).to.equal('Sauron');
			expect(res[1].name).to.equal('Sam');
		});
	});
});
