'use strict';

/* eslint-disable padded-blocks */
const parse = function QueryStringToOrientJSQuery(query, clusterName) {

	if (Object.keys(query).length === 0) {
		return query;
	}

    /* eslint-disable prefer-const */
	let queryParams = {};
	const queryPrefix = `Select FROM \`${clusterName}\``;

	let queryOrderParams = '';
	let querySearchParams = '';
	Object.keys(query).forEach((k) => {
		const key = k;
		const value = query[key];

		if (key === 'sort') {
			value.split(',').forEach((prop) => {
				const sortOrder = prop.split(':');

				if (sortOrder.length === 1 || (sortOrder[1] !== 'asc' && sortOrder[1] !== 'desc')) {
					sortOrder[1] = 'asc';
				}

				if (queryOrderParams === '') {
                    queryOrderParams = ' ORDER BY ';
                }

                queryOrderParams += `${sortOrder[0]} ${sortOrder[1].toUpperCase()}`;
			});
		} else {
			if (querySearchParams === '') {
                querySearchParams = ' WHERE ';
            } else {
                querySearchParams += ' AND ';
            }

			querySearchParams += `${key} LIKE :${key}Sub`;
			queryParams[`${key}Sub`] = `${value}%`;
		}
	});

	const queryString = queryPrefix + querySearchParams + queryOrderParams;

    return {
		queryString,
		queryParameter: {
			params: queryParams,
		},
	};
};

module.exports = parse;
