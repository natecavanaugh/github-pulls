import React from 'react';
import {createDevTools} from 'redux-devtools';
import LogMonitor from 'redux-devtools-log-monitor';
import DockMonitor from 'redux-devtools-dock-monitor';

export default createDevTools(
	<DockMonitor
		defaultIsVisible={false}
		defaultPosition="bottom"
		toggleVisibilityKey="ctrl-h"
		changePositionKey="ctrl-q"
	>
		<LogMonitor />
	</DockMonitor>
);