import React, {Component} from 'react';
import Modal from './Modal';
import Icon from './Icon';
import AutoForm from 'react-auto-form';
import _ from 'lodash';

const REGEX_VALID_REPO_BASE = /([^\W_](?:[\w\-]+|[^\W_])?\/[\w\-.]+?)/;

const REGEX_GITHUB_REPO = new RegExp(`(?:^((?:git@|https:\/\/)?(?:github.com[\/:]))?|^)${REGEX_VALID_REPO_BASE.source}(?:$|(\.git)?$)`);

const REGEX_VALID_REPO = new RegExp(`^${REGEX_VALID_REPO_BASE.source}$`);

import isURL from 'validator/lib/isURL';

class Config extends Component {
	constructor(props, context) {
		super(props, context);

		this.state = {
			...props.config,
			errorFields: {},
			repos: [...props.config.repos, '']
		};

		this.addField = this.addField.bind(this);
		this.createRepos = this.createRepos.bind(this);
		this.handleBlur = this.handleBlur.bind(this);
		this.validateRepo = this.validateRepo.bind(this);
		this.handleCheckboxChange = this.handleCheckboxChange.bind(this);
		this.handleServerChange = this.handleServerChange.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
		this.removeField = this.removeField.bind(this);
	}

	componentDidUpdate(prevProps, prevState) {
		if (this.state.focusLastField) {
			this.focusLastField();

			this.setState({focusLastField: false});
		}
	}

	clearError(index) {
		var {errorFields, errorMsg} = this.state;

		delete errorFields[index];

		if (!_.size(errorFields)) {
			errorMsg = null;
		}

		this.setState({errorFields, errorMsg});
	}

	setError(index) {
		var {errorFields, errorMsg} = this.state;

		if (_.isObject(index)) {
			_.merge(errorFields, index);
		}
		else {
			errorFields[index] = true;
		}

		if (!errorMsg) {
			errorMsg = 'One or more of your fields has an error.';
		}

		this.setState({errorFields, errorMsg});
	}

	getInput(index) {
		return this.refs[`repos${index}`];
	}

	focusLastField() {
		var {repos} = this.state;

		var lastIndex = repos.length - 1;

		var input = this.getInput(lastIndex);

		if (input) {
			input.focus();
		}
	}

	addField(event) {
		var {repos} = this.state;

		var length = repos.length;
		var lastIndex = length - 1;
		var lastRepoField = repos[lastIndex];

		if (lastRepoField.trim()) {
			length = repos.push('');
			lastIndex = length - 1;

			this.clearError(lastIndex);
		}

		this.setState({focusLastField: true, repos});
	}

	removeField(event, index) {
		var {repos} = this.state;

		repos.splice(index, 1);

		this.clearError(index);

		if (!repos.length) {
			repos.push('');
		}

		this.setState({focusLastField: true, repos});
	}

	createRepos(item, index, coll) {
		var hasError = this.state.errorFields[index] === true;

		var btnClass = 'btn btn-';
		var groupClass = 'input-group ';

		if (hasError) {
			btnClass += 'danger';
			groupClass += 'has-error';
		}
		else {
			btnClass += 'default';
		}

		var disabled = !item;

		return <div key={'configRepos' + index} className={groupClass}>
			<input className="form-control" id={'repos' + index} name="repos" onBlur={(event) => this.handleBlur(event, index)} onChange={(event) => this.handleChange(event, index)} onPaste={(event) => this.handlePaste(event, index)} placeholder="e.g. natecavanaugh/github-pulls" ref={'repos' + index} value={item} />
			<div className="input-group-btn">
				<button aria-label="Remove" className={btnClass} onClick={(event) => this.removeField(event, index)} type="button"><Icon name="hr" /></button>
				<button aria-label="Add" className={btnClass} disabled={disabled} onClick={this.addField} type="button"><Icon name="plus" /></button>
			</div>
		</div>;
	}

	handleBlur(event, index) {
		var {repos} = this.state;

		var value = event.target.value.trim();

		var validRepo = this.validateRepo(value);

		var clearError = false;

		if (validRepo !== false) {
			repos[index] = validRepo;

			clearError = true;
		}
		else if (value) {
			this.setError(index);
		}
		else {
			clearError = true;
		}

		if (clearError) {
			this.clearError(index);
		}

		this.setState({repos});
	}

	handleChange(event, index) {
		var {repos} = this.state;

		repos[index] = event.target.value;

		this.setState({repos});
	}

	handleCheckboxChange(event) {
		var {name, checked} = event.target;

		this.setState(
			{
				[name]: checked
			}
		);
	}

	handlePaste(event, index) {
		var data = event.clipboardData.getData('text/plain');

		if (data.indexOf('\n') > -1) {
			event.preventDefault();

			var lines = data.split('\n');

			lines = lines.reduce(
				(prev, item) => {
					item = item.trim();
					if (item) {
						prev.push(item);
					}
					return prev;
				},
				[]
			);

			if (lines.length) {
				var {repos} = this.state;

				event.target.value = lines[0];

				var ind = repos.indexOf('');

				ind = ind === -1 ? repos.length : ind;

				repos.splice(ind, 0, ...lines);

				this.setState({focusLastField: true, repos});
			}

		}
	}

	handleServerBlur = (event) => {
		var {id, value} = event.target;

		var validURL = isURL(value.trim());

		if (!validURL) {
			this.setError(id);
		}
		else {
			this.clearError(id);
		}
	}

	handleServerChange = (event) => {
		var {name, value} = event.target;

		this.setState(
			{
				[name]: value
			}
		);
	}

	handleSubmit(event, data) {
		event.preventDefault();

		var state = this.state;

		var dataRepos = data.repos;

		dataRepos = _.castArray(dataRepos);

		var errorFields = {};

		var validRepos = dataRepos.reduce(
			(prev, item, index) => {
				if (item.trim()) {
					var repo = item.replace(REGEX_GITHUB_REPO, (str, domain, baseRepo, gitExt) => baseRepo);

					if (REGEX_VALID_REPO.test(repo)) {
						prev.push(repo);
					}
					else {
						prev.push(item);

						errorFields[index] = true;
					}
				}

				return prev;
			},
			[]
		);

		validRepos = _.uniq(validRepos);

		data.repos = [...validRepos];

		data.displayComments = state.displayComments;
		data.displayJira = state.displayJira;
		data.displayStatus = state.displayStatus;
		data.jiraServer = state.jiraServer;

		if (!validRepos.length) {
			validRepos.push('');
		}

		if (!_.size(errorFields)) {
			this.props.saveConfig(data);
		}
		else {
			this.setError(errorFields);
		}

		this.setState({repos: validRepos});
	}

	validateRepo(value) {
		var valid = false;

		if (value.trim()) {
			var repo = value.replace(REGEX_GITHUB_REPO, (str, domain, baseRepo, gitExt) => baseRepo);

			if (REGEX_VALID_REPO.test(repo)) {
				valid = repo;
			}
		}

		return valid;
	}

	render() {
		var props = this.props;
		var state = this.state;

		var config = props.config;

		var allRepos = state.repos.map(this.createRepos);

		var {errorMsg} = state;

		var error = null;

		var hasErrors = _.size(state.errorFields);

		if (errorMsg && hasErrors) {
			error = <div className="alert alert-danger">{errorMsg}</div>;
		}

		var defaultJiraServerValue = 'https://issues.liferay.com';

		var displayComments = _.get(state, 'displayComments', true);
		var displayJira = _.get(state, 'displayJira', true);
		var displayStatus = _.get(state, 'displayStatus', true);
		var jiraServerValue = _.get(state, 'jiraServer', defaultJiraServerValue);

		var jiraServer;

		if (displayJira) {
			var jiraErrors = !isURL(jiraServerValue);

			jiraServer = (
				<div className={`form-group ${(jiraErrors) ? 'has-error' : ''}`}>
					<label className="sr-only" htmlFor="jiraServer">JIRA Server URL</label>
					<input className="form-control" onBlur={this.handleServerBlur} onChange={this.handleServerChange} id="jiraServer" name="jiraServer"  placeholder={defaultJiraServerValue} required type="url" defaultValue={jiraServerValue} />
				</div>
			);
		}

		return (
			<AutoForm onSubmit={this.handleSubmit}>
				<Modal close={props.closeConfig} title="Settings" disableSave={hasErrors}>
					{error}
					<div className="config-section config-repos">
						<h3>Repos</h3>
						{allRepos}
					</div>
					<div className="config-section config-display">
						<h3>Display</h3>
						<div className="checkbox">
							<label>
								<input checked={displayComments} name="displayComments" onChange={this.handleCheckboxChange} type="checkbox" /> Comment Count
							</label>
						</div>
						<div className="checkbox">
							<label>
								<input checked={displayStatus} name="displayStatus" onChange={this.handleCheckboxChange} type="checkbox" /> Pull Status
							</label>
						</div>
						<div className="form-inline">
							<div className="checkbox">
								<label>
									<input checked={displayJira} name="displayJira" onChange={this.handleCheckboxChange} type="checkbox" /> <span title="JIRA-like ids are any uppercase alphanumeric letters (at least 3 characters) followed by a dash and a number, eg. FOO-1234">Link JIRA-like ID's to JIRA.</span>
								</label>
							</div>

							{jiraServer}
						</div>
					</div>
				</Modal>
			</AutoForm>
		);
	}
}

export default Config;