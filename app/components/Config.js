import React, {Component} from 'react';
import Modal from './Modal';
import Icon from './Icon';
import AutoForm from 'react-auto-form';
import _ from 'lodash';

const REGEX_VALID_REPO_BASE = /([^\W_](?:[\w\-]+|[^\W_])?\/[\w\-.]+?)/;

const REGEX_VALID_REPO = new RegExp(`^${REGEX_VALID_REPO_BASE.source}$`);

const REGEX_GITHUB_REPO = new RegExp(`(?:^((?:git@|https:\/\/)?(?:github.com[\/:]))?|^)${REGEX_VALID_REPO_BASE.source}(?:$|(\.git)?$)`);

class Config extends Component {
	constructor(props, context) {
		super(props, context);

		this.state = {
			errorFields: {},
			repos: [...props.config.repos, '']
		};

		this.addField = this.addField.bind(this);
		this.createRepos = this.createRepos.bind(this);
		this.handleBlur = this.handleBlur.bind(this);
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

	handleSubmit(event, data) {
		event.preventDefault();

		var dataRepos = data.repos;

		dataRepos = _.isArray(dataRepos) ? dataRepos : [dataRepos];

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
		var allRepos = this.state.repos.map(this.createRepos);

		var {errorMsg} = this.state;

		var error = null;

		var hasErrors = _.size(this.state.errorFields);

		if (errorMsg && hasErrors) {
			error = <div className="alert alert-danger">{errorMsg}</div>;
		}

		return (
			<AutoForm onSubmit={this.handleSubmit}>
				<Modal close={this.props.closeConfig} title="Settings" disableSave={hasErrors}>
					{error}
					<label htmlFor="repos">Repos</label>
					<div className="config-repos">
						{allRepos}
					</div>
				</Modal>
			</AutoForm>
		);
	}
}

export default Config;