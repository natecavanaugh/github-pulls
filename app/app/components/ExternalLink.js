import React, {Component} from 'react';
import {shell} from 'electron';

export default class ExternalLink extends Component {
	handleOnClick(event) {
		event.preventDefault();

		if (this.props.stopPropagation) {
			event.stopPropagation();
		}

		shell.openExternal(event.currentTarget.getAttribute('href'));
	}

	render() {
		var props = this.props;

		var title = props.children || props.title;

		return <a {...props} onClick={(e) => this.handleOnClick(e)}>{title}</a>;
	}
}