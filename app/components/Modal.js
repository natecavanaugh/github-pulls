import React, { Component, PropTypes } from 'react';

export class Modal extends Component {
	// This feels a bit hacky, but I can't imagine where else to best keep it
	componentDidMount() {
		document.body.classList.add('modal-open');
	}

	componentWillUnmount() {
		document.body.classList.remove('modal-open');
	}

	render() {
		var props = this.props;

		return (
			<div className="modal fade in modal-sheet" tabIndex="-1" role="dialog">
				<div className="modal-dialog">
					<div className="modal-content">
						<div className="modal-header">
							<button type="button" className="close" data-dismiss="modal" aria-label="Close" onClick={() => props.close()}>
							<span aria-hidden="true">&times;</span></button>
							<h4 className="modal-title">{props.title}</h4>
						</div>
						<div className="modal-body">
							{this.props.children}
						</div>
						<div className="modal-footer">
							<button type="button" className="btn btn-default" data-dismiss="modal" onClick={() => props.close()}>Close</button>
							<button disabled={props.disableSave} type="submit" className="btn btn-primary">Save</button>
						</div>
					</div>
				</div>
			</div>
		);
	}
}

export default Modal;