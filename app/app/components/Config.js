import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import Modal from './Modal';
import Icon from './Icon';
import AutoForm from 'react-auto-form';
import _ from 'lodash';
import { Button, Checkbox, FormGroup, ControlLabel, FormControl, InputGroup } from 'react-bootstrap';

const REGEX_VALID_REPO_BASE = /([^\W_](?:[\w\-]+|[^\W_])?(\/[\w\-.]+?)?)/;

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

		if (_.isObject(index)) {
			if (!_.isArray(index)) {
				index = _.keys(index);
			}
		}

		errorFields = _.omit(errorFields, _.castArray(index));

		if (!_.size(errorFields)) {
			errorMsg = null;
		}

		this.setState({errorFields, errorMsg});
	}

	setError(index) {
		var {errorFields, errorMsg} = this.state;

		if (_.isObject(index)) {
			var types = _.transform(index, (acc, n,i) => acc[!!n][i] = n, {true: {}, false: {}});

			errorFields = types.true;

			_.merge(errorFields, index);

			this.clearError(types.false);
		}
		else {
			errorFields[index] = true;
		}

		if (!errorMsg) {
			errorMsg = 'One or more of your fields has an error.';
		}

		this.setState({errorFields, errorMsg});
	}

	getInput(ref) {
		var node = ReactDOM.findDOMNode(this.refs[ref]);

		return node;
	}

	focusLastField() {
		var {repos} = this.state;

		var lastIndex = repos.length - 1;

		var input = this.getInput(`repos${lastIndex}`);

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

			this.clearError(`repos${lastIndex}`);
		}

		this.setState({focusLastField: true, repos});
	}

	removeField(event) {
		var {repos} = this.state;

		var {dataset: {index}} = event.currentTarget;

		repos.splice(index, 1);

		this.clearError(`repos${index}`);

		if (!repos.length) {
			repos.push('');
		}

		this.setState({focusLastField: true, repos});
	}

	createRepos(item, index, coll) {
		var repoKey = `repos${index}`;

		var hasError = this.state.errorFields[repoKey] === true;

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

		return <FormGroup key={`configRepos${index}`}>
			<InputGroup className={groupClass}>
				<FormControl type="text" data-index={index} id={repoKey} name="repos" onBlur={this.handleBlur} onChange={this.handleChange} onPaste={this.handlePaste} placeholder="e.g. liferay or natecavanaugh/github-pulls" ref={repoKey} value={item} />
				<InputGroup.Button>
					<Button aria-label="Remove" data-index={index} className={btnClass} onClick={this.removeField}><Icon name="hr" /></Button>
					<Button aria-label="Add" data-index={index} className={btnClass} disabled={disabled} onClick={this.addField}><Icon name="plus" /></Button>
				</InputGroup.Button>
			</InputGroup>
		</FormGroup>
	}

	formatRepo(repo) {
		repo = repo.replace(REGEX_GITHUB_REPO, (str, domain, baseRepo, gitExt) => baseRepo);

		repo = _.trim(repo, ' /	');

		return repo;
	}

	handleBlur = (event) => {
		var {repos} = this.state;

		var {id, value, dataset: {index}} = event.target;

		value = value.trim();

		var validRepo = this.validateRepo(value);

		var clearError = false;

		if (validRepo !== false) {
			repos[index] = validRepo;

			clearError = true;
		}
		else if (value) {
			this.setError(id);
		}
		else {
			clearError = true;
		}

		if (clearError) {
			this.clearError(id);
		}

		this.setState({repos});
	}

	handleChange = (event) => {
		var {repos} = this.state;

		var {value, dataset: {index}} = event.target;

		repos[index] = value;

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

	handlePaste = (event) => {
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
					var repo = this.formatRepo(item);

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
			var repo = this.formatRepo(value);

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

		var hasErrors = _.size(state.errorFields);

		var defaultJiraServerValue = 'https://issues.liferay.com';

		var displayComments = _.get(state, 'displayComments', true);
		var displayJira = _.get(state, 'displayJira', true);
		var displayStatus = _.get(state, 'displayStatus', true);
		var jiraServerValue = _.get(state, 'jiraServer', defaultJiraServerValue);

		var jiraServer;

		if (displayJira) {
			var jiraErrors = !isURL(jiraServerValue);

			jiraServer = (
				<FormGroup className={`form-group ${(jiraErrors) ? 'has-error' : ''}`} controlId="jiraServer">
					<ControlLabel className="sr-only">JIRA Server URL</ControlLabel>
					<FormControl onBlur={this.handleServerBlur} onChange={this.handleServerChange} name="jiraServer"  placeholder={defaultJiraServerValue} required type="url" defaultValue={jiraServerValue} />
				</FormGroup>
			);
		}

		return (
			<AutoForm onSubmit={this.handleSubmit}>
				<Modal close={props.closeConfig} title="Settings" disableSave={hasErrors} errors={errorMsg}>
					<div className="config-section config-repos">
						<h3>Users &amp; Repos</h3>
						{allRepos}
					</div>
					<div className="config-section config-display">
						<h3>Display</h3>
						<Checkbox checked={displayComments} name="displayComments" onChange={this.handleCheckboxChange}>
							Comment Count
						</Checkbox>
						<Checkbox checked={displayStatus} name="displayStatus" onChange={this.handleCheckboxChange}>
							Pull Status
						</Checkbox>

						<Checkbox  checked={displayJira} name="displayJira" onChange={this.handleCheckboxChange}>
							<span title="JIRA-like ids are any uppercase alphanumeric letters (at least 3 characters) followed by a dash and a number, eg. FOO-1234">
								Link JIRA-like ID's to JIRA.
							</span>
						</Checkbox>

						{jiraServer}
					</div>
				</Modal>
			</AutoForm>
		);
	}
}

export default Config;