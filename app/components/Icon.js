import React, {PropTypes} from 'react';

const Icon = ({name}) => {
	return <svg className={`lexicon-icon lexicon-icon-${name}`}><use xlinkHref={`../bower_components/lexicon/release/images/icons/icons.svg#${name}`}></use></svg>;
};

Icon.propTypes = {
	name: PropTypes.string.isRequired
};

export default Icon;