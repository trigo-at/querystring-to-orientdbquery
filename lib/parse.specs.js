'use strict';

const { should } = require('chai');
const parse = require('./parse');

/* eslint-disable padded-blocks */
describe('QueryString to OrientDB SQL String tests', () => {

    describe('Search - WHERE / LIKE specs', () => {

        it('should return all records with name `Chuck` and age `77`', async() => {
            const query = {
                name: 'Chuck',
                age: '77',
            };

            const { queryString, queryParams, countQueryString } = parse(query, 'TestCluster');
            console.log(queryString)
            console.log(countQueryString)
        });
    });

    describe('Search - WHERE = specs', () => {
        it('should return all records with name `Chuck` and age 77', async() => {
            const query = {
                name: 'Chuck',
                age: 77,
            };

            const { queryString, queryParams, countQueryString } = parse(query, 'TestCluster');
            console.log(queryString)
            console.log(countQueryString)
        });
    });
});
