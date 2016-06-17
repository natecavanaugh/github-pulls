import {Schema, arrayOf} from 'normalizr';

const repoSchema = new Schema(
	'repos',
	{
		idAttribute: 'path'
	}
);

const pullSchema = new Schema(
	'pulls',
	{
		idAttribute: 'number'
	}
);

const branchSchema = new Schema(
	'branches',
	{
		idAttribute: entity => entity[0].base.ref
	}
);

const issueSchema = new Schema(
	'issues',
	{
		idAttribute: 'id'
	}
);

const userSchema = new Schema(
	'users',
	{
		idAttribute: 'login'
	}
);

repoSchema.define(
	{
		allIssues: arrayOf(issueSchema),
		owner: userSchema
	}
);

export var Schemas = {
	BRANCH: branchSchema,
	BRANCH_ARRAY: arrayOf(branchSchema),
	PULL: pullSchema,
	PULL_ARRAY: arrayOf(pullSchema),
	REPO: repoSchema,
	REPO_ARRAY: arrayOf(repoSchema)
};

export const PULLS_FAILURE = 'PULLS_FAILURE';
export const PULLS_REQUEST = 'PULLS_REQUEST';
export const PULLS_SUCCESS = 'PULLS_SUCCESS';

export function pullsRequest() {
	return {
		type: PULLS_REQUEST
	};
}

export function pullsSuccess(response) {
	return {
		response,
		type: PULLS_SUCCESS
	};
}

export function pullsFailure(err) {
	return {
		err,
		type: PULLS_FAILURE
	};
}

export function loadPulls() {
	return (dispatch, getState) => {
		return dispatch(pullsRequest());
	};
}