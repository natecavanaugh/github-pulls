import _ from 'lodash';
import moment from 'moment';

import { Schema, arrayOf, valuesOf, normalize } from 'normalizr'
import { camelizeKeys } from 'humps'

import pulls from '../utils/pulls';
import github from '../utils/github';

const repoSchema = new Schema('repos', {
  idAttribute: 'path'
})
const pullSchema = new Schema('pulls', {
  idAttribute: 'number'
})

const branchSchema = new Schema('branches', {
  idAttribute: (entity) => {console.log(entity, arguments); return entity[0].base.ref}
})

const issueSchema = new Schema('issues', {
  idAttribute: 'id'
})

const userSchema = new Schema('users', {
  idAttribute: 'login'
})

repoSchema.define({
  allIssues: arrayOf(issueSchema),
  owner: userSchema
});

export var Schemas = {
  BRANCH: branchSchema,
  BRANCH_ARRAY: arrayOf(branchSchema),
  PULL: pullSchema,
  PULL_ARRAY: arrayOf(pullSchema),
  REPO: repoSchema,
  REPO_ARRAY: arrayOf(repoSchema)
}

export const PULLS_REQUEST = 'PULLS_REQUEST'
export const PULLS_SUCCESS = 'PULLS_SUCCESS'
export const PULLS_FAILURE = 'PULLS_FAILURE'

import Promise from 'bluebird';

export function pullsRequest() {
	return {
		type: PULLS_REQUEST
	}
};

export function pullsSuccess(response) {
	return {
		type: PULLS_SUCCESS,
		response
	}
};

export function pullsFailure(err) {
	return {
		type: PULLS_FAILURE,
		err
	}
};

export function loadPulls() {
	return (dispatch, getState) => {
		return dispatch(pullsRequest());
	}
}