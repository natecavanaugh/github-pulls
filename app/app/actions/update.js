import {ipcRenderer} from 'electron';
import _ from 'lodash';

export const UPDATE_AVAILABLE = 'UPDATE_AVAILABLE';
export const UPDATE_CHECK = 'UPDATE_CHECK';
export const UPDATE_DOWNLOAD = 'UPDATE_DOWNLOAD';
export const UPDATE_LATER = 'UPDATE_LATER';

function startDownload() {
	return {
		type: UPDATE_DOWNLOAD
	};
}

export function updateCheck(time) {
	return {
		time,
		type: UPDATE_CHECK
	};
}

function updateAvailable(available) {
	return {
		available,
		type: UPDATE_AVAILABLE
	};
}

function updateLater() {
	return {
		type: UPDATE_LATER
	};
}

export function updateNotify(available) {
	return (dispatch, getState) => {
		dispatch(updateAvailable(available));
	};
}

export function downloadNewVersion() {
	return (dispatch, getState) => {
		dispatch(startDownload());

		ipcRenderer.send('downloadUpdates');
	};
}

export function remindMeLater() {
	return (dispatch, getState) => {
		dispatch(updateLater());

		if (listenerAdded && _.isFunction(listenerAdded)) {
			ipcRenderer.removeListener('updateAvailable', listenerAdded);
		}
	};
}

var listenerAdded = false;

export function checkForUpdates(time) {
	return (dispatch, getState) => {
		// Not a fan of doing it this way, but not sure
		// how else to dispatch an available update
		// without it constantly adding multiple listeners

		if (!listenerAdded) {
			listenerAdded = (event, available) => {
				dispatch(updateAvailable(available));
			};

			ipcRenderer.on(
				'updateAvailable',
				listenerAdded
			);
		}

		dispatch(updateCheck(time));

		ipcRenderer.send('checkForUpdates');
	};
}