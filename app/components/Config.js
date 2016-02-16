import React, { Component, PropTypes } from 'react';
import Modal from './Modal';
import AutoForm from 'react-auto-form';
import _ from 'lodash';

const REGEX_VALID_REPO_BASE = /([^\W_](?:[\w\-]+|[^\W_])?\/[\w\-.]+?)/;
// const REGEX_VALID_REPO_BASE = /([^\W_][\w\-]+[A-Za-z0-9][^\W_]\/[\w\-.]+?)/;
const REGEX_VALID_REPO = new RegExp(`^${REGEX_VALID_REPO_BASE.source}$`);
const REGEX_GITHUB_REPO = new RegExp(`(?:^((?:git@|https:\/\/)?(?:github.com[\/:]))?|^)${REGEX_VALID_REPO_BASE.source}(?:$|(\.git)?$)`);

class Config extends Component {
	constructor(props, context) {
		super(props, context);

		this.state = {
			repos: [...props.config.repos, ''],
			errorFields: {}
		};

		this.addField = this.addField.bind(this);
		this.removeField = this.removeField.bind(this);
		this.createRepos = this.createRepos.bind(this);
		this.handleBlur = this.handleBlur.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
	}

	componentDidUpdate(prevProps, prevState) {
		if (this.state.focusLastField) {
			this.focusLastField();
			this.setState({focusLastField: false});
		}
		// console.log(prevState.repos === this.state.repos);
	}

	clearError(index) {
		var { errorFields, errorMsg } = this.state;

		delete errorFields[index];

		if (!_.size(errorFields)) {
			errorMsg = null;
		}

		this.setState({ errorFields, errorMsg });
	}

	setError(index) {
		var { errorFields, errorMsg } = this.state;

		if (_.isObject(index)) {
			_.merge(errorFields, index);
		}
		else {
			errorFields[index] = true;
		}

		if (!errorMsg) {
			errorMsg = 'One or more of your fields has an error.';
		}

		this.setState({ errorFields, errorMsg });
	}

	getInput(index) {
		return this.refs[`repos${index}`];
	}

	focusLastField() {
		var { repos } = this.state;

		var lastIndex = repos.length - 1;

		var input = this.getInput(lastIndex);

		if (input) {
			input.focus();
		}
	}

	addField(event) {
		var { repos } = this.state;

		var length = repos.length;
		var lastIndex = length - 1;
		var lastRepoField = repos[lastIndex];

		if (lastRepoField.trim()) {
			length = repos.push('');
			lastIndex = length - 1;

			this.clearError(lastIndex);
		}

		this.setState({ repos, focusLastField: true  });

		// this.focusLastField();
	}

	removeField(event, index) {
		var { repos } = this.state;

		repos.splice(index, 1);

		this.clearError(index);

		if (!repos.length) {
			repos.push('');
		}

		// this.focusLastField();

		this.setState({ repos, focusLastField: true });
	}

	createRepos(item, index, coll) {
		var hasError = this.state.errorFields[index] === true;

		var groupClass = 'input-group ';
		var btnClass = 'btn btn-';

		if (hasError) {
			groupClass += 'has-error';
			btnClass += 'danger';
		}
		else {
			btnClass += 'default';
		}

		var disabled = !item;

		return <div key={'configRepos' + index} className={groupClass}>
			<input className="form-control" id={"repos" + index} name="repos" onBlur={(event) => this.handleBlur(event, index)} onChange={(event) => this.handleChange(event, index)} onPaste={(event) => this.handlePaste(event, index)} placeholder="e.g. natecavanaugh/github-pulls" ref={"repos" + index} value={item}  />
			<div className="input-group-btn">
				<button aria-label="Remove" className={btnClass} onClick={(event) => this.removeField(event, index)} type="button"><span className="fa fa-minus"></span></button>
				<button aria-label="Add" className={btnClass} disabled={disabled}  onClick={this.addField} type="button"><span className="fa fa-plus"></span></button>
			</div>
		</div>;
	}

	handleBlur(event, index) {
		var { repos, errorFields } = this.state;

		var value = event.target.value.trim();

		var validRepo = this.validateRepo(value);

		var clearError = false;

		if (validRepo !== false) {
			repos[index] = validRepo;

			clearError = true;
		}
		else {
			if (value) {
				this.setError(index);
			}
			else {
				clearError = true;
			}
		}

		if (clearError) {
			this.clearError(index);
		}

		this.setState({repos});
	}

	handleChange(event, index) {
		var { repos } = this.state;

		repos[index] = event.target.value;

		this.setState({repos});

		// console.log('handleChange');
	}

	handlePaste(event, index) {
		var data = event.clipboardData.getData('text/plain');

		if (data.indexOf('\n') > -1) {
			event.preventDefault();

			var lines = data.split('\n');

			// event.target.value = val;

			lines = lines.reduce((prev, item) => {
				item = item.trim();
				if (item) {
					prev.push(item);
				}
				return prev;
			}, []);

			if (lines.length) {
				var { repos } = this.state;

				event.target.value = lines[0];

				var ind = repos.indexOf('');

				ind = ind === -1 ? repos.length : ind;

				repos.splice(ind, 0, ...lines);

				// repos = [...lines, ...repos]
				// repos.push(...lines);
				// repos.push(..._.rest(lines));
			console.log('handlePaste', repos, lines);

				this.setState({repos, focusLastField: true});
			}

		}
	}

	handleSubmit(event, data) {
		event.preventDefault();

		var dataRepos = data.repos;

		dataRepos = _.isArray(dataRepos) ? dataRepos : [dataRepos];

		var errorFields = {};

		var validRepos = dataRepos.reduce(
			function(prev, item, index) {
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

		// console.log(validRepos, errorFields, data.repos);

		/*
		// extract github username/repo

		const REGEX_GITHUB_REPO = /^((?:git@|https:\/\/)?(?:github.com[\/:]))?([^\W_][\w\-]+[A-Za-z0-9][^\W_]\/[\w\-.]+?)(\.git)?$/;
		var urls = [
			'https://github.com/liferay/liferay-portal',
			'https://github.com/liferay/liferay-portal.git',
			'git@github.com:liferay/liferay-portal.git',
			'https://github.com/liferay/liferay-portal.git',
			'https://github.com/liferay/liferay-portal'
		];
		urls.every((url) => {
			var newURL = url.replace(REGEX_GITHUB_REPO, function(str, domain, repo, gitExt){
				return repo;
			});
			console.log(newURL);

			return newURL === 'liferay/liferay-portal';
		})*/
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

		var { errorMsg } = this.state;

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