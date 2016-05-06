import React, {Component} from 'react';
import Icon from './Icon';
import { Modal as BSModal, Button, OverlayTrigger, Popover } from 'react-bootstrap';

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

		var reason;

		if (props.disableSave && props.errors) {
			var icon = <Icon className="text-danger" name="exclamation-circle" />;
			var popoverTitle = <span>{icon} {'Can\'t save your configuration'}</span>;

			var popover = (
				<Popover className="config-popover" id="configSaveErrorMsg" title={popoverTitle}>
					<div className="text-danger">{props.errors}</div>
				</Popover>
			);

			reason = (
				<OverlayTrigger overlay={popover} placement="top" rootClose trigger={[/*'hover', 'focus', */'click']}>
					<Button bsStyle="link">{icon}</Button>
				</OverlayTrigger>
			);
		}

		var modal;

		return (
			<BSModal.Dialog className="modal-sheet fade in">
				<BSModal.Header closeButton onHide={props.close}>
					<BSModal.Title>{props.title}</BSModal.Title>
				</BSModal.Header>
				<BSModal.Body>
					{props.children}
				</BSModal.Body>
				<BSModal.Footer>
					<Button onClick={props.close}>Close</Button>
					<Button bsStyle="primary" disabled={!!props.disableSave} type="submit">Save</Button>
					{' '}{reason}
				</BSModal.Footer>
			</BSModal.Dialog>
		);
	}
}

export default Modal;