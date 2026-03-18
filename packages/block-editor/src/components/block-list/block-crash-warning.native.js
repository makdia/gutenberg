/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import Warning from '../warning';

const warning = (
	<Warning
		message={ __(
			'This block has encountered an error and cannot be previewed.'
		) }
	/>
);

// eslint-disable-next-line react/display-name
export default () => warning;
