/**
 * WordPress dependencies
 */
import { useEffect, useContext, useRef } from '@wordpress/element';

/**
 * Internal dependencies
 */
import { inputEventContext } from './';

export function __unstableRichTextInputEvent( { inputType, onInput } ) {
	// eslint-disable-next-line react-hooks/rules-of-hooks
	const callbacks = useContext( inputEventContext );
	// eslint-disable-next-line react-hooks/rules-of-hooks
	const onInputRef = useRef();
	onInputRef.current = onInput;

	// eslint-disable-next-line react-hooks/rules-of-hooks
	useEffect( () => {
		function callback( event ) {
			if ( event.inputType === inputType ) {
				onInputRef.current();
				event.preventDefault();
			}
		}

		callbacks.current.add( callback );
		return () => {
			callbacks.current.delete( callback );
		};
	}, [ inputType ] );

	return null;
}
