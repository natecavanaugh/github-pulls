import React, {PropTypes} from 'react';
import InlineSVG from 'svg-inline-react';

const Icon = ({className = '', name}) => {
	var src = require(`!svg-inline!../../bower_components/lexicon/release/images/icons/${name}.svg`);

	src = src.replace(/ (?:style|xml:space)=(["'])(?:(?!\1).)*\1/g, '');

	return <InlineSVG className={`lexicon-icon lexicon-icon-${name} ${className}`} raw={true} src={src} />;
};

Icon.propTypes = {
	className: PropTypes.string,
	name: PropTypes.string.isRequired
};

export default Icon;