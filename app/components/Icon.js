import React, {PropTypes} from 'react';

const Icon = ({className, name}) => {
	return <svg className={`lexicon-icon lexicon-icon-${name} ${className}`}><use xlinkHref={`../bower_components/lexicon/release/images/icons/icons.svg#${name}`}></use></svg>;
};

Icon.propTypes = {
	className: PropTypes.string,
	name: PropTypes.string.isRequired
};

export default Icon;