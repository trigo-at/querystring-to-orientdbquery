'use strict';

/* eslint-disable padded-blocks */
const parse = function QueryStringToOrientJSQuery(query, clusterName) {

	if (!clusterName) {
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
                } else {
                    queryOrderParams += ',';
                }

                queryOrderParams += `${sortOrder[0]} ${sortOrder[1].toUpperCase()}`;
			});
		} else if (key !== 'page' && key !== 'pageSize') {
			if (querySearchParams === '') {
                querySearchParams = ' WHERE ';
            } else {
                querySearchParams += ' AND ';
            }

			if (Array.isArray(value)) {
				querySearchParams += `${key} IN :${key}Param`;
				queryParams[`${key}Param`] = value;
			} else if (typeof(value) === 'number') {
				querySearchParams += `${key}=:${key}Param`;
				queryParams[`${key}Param`] = value;
			} else {
				querySearchParams += `${key} LIKE :${key}Param`;
				queryParams[`${key}Param`] = `${value}%`;
			}
		}
	});

    const pageSize = query.pageSize || 25;
    const page = query.page || 1;

    const pagingPostfix = ` SKIP ${(pageSize * page) - pageSize} LIMIT ${pageSize}`;
	const queryString = queryPrefix + querySearchParams + queryOrderParams + pagingPostfix;

    const countQueryString = `SELECT COUNT(*) FROM \`${clusterName}\`` + querySearchParams;

    return {
		queryString,
		queryParameter: {
			params: queryParams,
		},
        countQueryString,
	};
};

module.exports = parse;
