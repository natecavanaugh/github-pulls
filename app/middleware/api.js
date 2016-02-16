import { Schema, arrayOf, normalize } from 'normalizr'
import { camelizeKeys } from 'humps'

import settings from '../utils/settings';
import pulls from '../utils/pulls';

// Action key that carries API call info interpreted by this Redux middleware.
export const CALL_API = Symbol('Call API')

import github from '../utils/github';

const repoSchema = new Schema('repos', {
  idAttribute: 'id'
});

// Schemas for Github API responses.
export const Schemas = {
  REPO: repoSchema,
  REPO_ARRAY: arrayOf(repoSchema)
};

// A Redux middleware that interprets actions with CALL_API info specified.
// Performs the call and promises when such actions are dispatched.
export default function(store) {
	return function(next) {
		return function(action) {
			function actionWith(data) {
				const finalAction = Object.assign({}, action, data)
				delete finalAction[CALL_API]
				return finalAction
			}

			const callAPI = action[CALL_API];

			if (typeof callAPI === 'undefined') {
				return next(action);
			}

			const { types, request, schema } = callAPI;

			const [ requestType, successType, failureType ] = types

			next(actionWith({ type: requestType }));

			if (!request) {
				return next(action);
			}

			request(
				function(err, response) {
					if (err) {
						return next(actionWith(
							{
								type: failureType,
								error: err.message || 'Request failed'
							}
						));
					}

					const camelizedJson = camelizeKeys(response);

					const filteredJSON = Object.assign({}, normalize(camelizedJson, schema));

					next(
						actionWith({
							response: filteredJSON,
							type: successType
						})
					);
				}
			);



		// pulls.getAllRepos(_.flow(pulls.filterRepos, _.bindRight(pulls.getPullRequests, null, function(results) {
		// 	next(action);
		// 	// instance.setState({
		// 	// 	results: results.repos,
		// 	// 	total: results.total
		// 	// });

		// 	// instance.setState({
		// 	// 	loading: false
		// 	// });

		// 	// instance._loadPullsTask();

		// 	// if (attempts < 5) {
		// 	// 	console.log('Recovering from error: %d @ %s', attempts, new Date());
		// 	// 	attempts = 5;
		// 	// }
		// })));
		// setTimeout(function() {
		//	next(action);
		//	console.log('middleware', action);
		// }, 1000);
	};
  };
};