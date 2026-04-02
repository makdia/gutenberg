import { AlertDialog as _AlertDialog } from '@base-ui/react/alert-dialog';
import { useCallback, useMemo, useRef, useState } from '@wordpress/element';

import { AlertDialogContext } from './context';
import type { ConfirmHandler, Phase } from './context';
import type { RootProps } from './types';

function isThenable( value: unknown ): value is PromiseLike< unknown > {
	return (
		value !== null &&
		value !== undefined &&
		typeof ( value as PromiseLike< unknown > ).then === 'function'
	);
}

/**
 * A dialog that requires a user response to proceed.
 *
 * Use `AlertDialog.Trigger` to render a button that opens the dialog.
 * Use `AlertDialog.Popup` to render the dialog content.
 * The `AlertDialog.Trigger` is optional — the dialog can also be controlled
 * via `open` / `onOpenChange` props.
 *
 * For use cases outside the standard confirm/cancel pattern, use the lower-level
 * `Dialog` component directly.
 *
 * See the [Destructive Actions guidelines](https://wordpress.github.io/gutenberg/?path=/docs/design-system-patterns-destructive-actions--docs)
 * for more details on when to use each pattern.
 */
function Root( {
	children,
	open: openProp,
	onOpenChange,
	defaultOpen,
	onConfirm,
	allowDismissWhilePending = false,
}: RootProps ) {
	const [ internalOpen, setInternalOpen ] = useState( defaultOpen ?? false );
	const [ phase, setPhase ] = useState< Phase >( 'idle' );
	const [ showSpinner, setShowSpinner ] = useState( false );

	const onConfirmRef = useRef( onConfirm );
	onConfirmRef.current = onConfirm;

	// Ref keeps phase accessible synchronously from callbacks that may
	// run between a setState call and the subsequent React re-render.
	const phaseRef = useRef( phase );
	phaseRef.current = phase;

	const effectiveOpen = openProp ?? internalOpen;

	const setOpen = useCallback(
		(
			nextOpen: boolean,
			reason?: _AlertDialog.Root.ChangeEventDetails[ 'reason' ]
		) => {
			setInternalOpen( nextOpen );
			onOpenChange?.( nextOpen, {
				reason:
					reason ?? ( nextOpen ? 'trigger-press' : 'close-press' ),
			} as _AlertDialog.Root.ChangeEventDetails );
		},
		[ onOpenChange ]
	);

	const handleOpenChange = useCallback(
		(
			nextOpen: boolean,
			eventDetails: _AlertDialog.Root.ChangeEventDetails
		) => {
			if (
				! nextOpen &&
				phase === 'pending' &&
				! allowDismissWhilePending
			) {
				return;
			}

			if ( ! nextOpen && phase === 'idle' ) {
				phaseRef.current = 'closing';
				setPhase( 'closing' );
			}

			setInternalOpen( nextOpen );
			onOpenChange?.( nextOpen, eventDetails );
		},
		[ onOpenChange, phase, allowDismissWhilePending ]
	);

	const confirm = useCallback(
		async ( overrideHandler?: ConfirmHandler ) => {
			if ( phaseRef.current !== 'idle' ) {
				return;
			}

			phaseRef.current = 'pending';
			setPhase( 'pending' );

			try {
				const handler = overrideHandler ?? onConfirmRef.current;
				const rawResult = handler?.();

				// Show spinner only for async handlers (Promises).
				// Sync handlers resolve in the same tick — no spinner needed.
				if ( isThenable( rawResult ) ) {
					setShowSpinner( true );
				}

				const result = await Promise.resolve( rawResult );
				const shouldClose = result?.close !== false;

				if ( shouldClose ) {
					phaseRef.current = 'closing';
					setPhase( 'closing' );
					setOpen( false, 'close-press' );
				} else {
					phaseRef.current = 'idle';
					setPhase( 'idle' );
					setShowSpinner( false );
				}
			} catch {
				phaseRef.current = 'idle';
				setPhase( 'idle' );
				setShowSpinner( false );
			}
		},
		[ setOpen ]
	);

	const handleOpenChangeComplete = useCallback( ( open: boolean ) => {
		if ( ! open ) {
			phaseRef.current = 'idle';
			setPhase( 'idle' );
			setShowSpinner( false );
		}
	}, [] );

	const contextValue = useMemo(
		() => ( {
			phase,
			showSpinner,
			confirm,
		} ),
		[ phase, showSpinner, confirm ]
	);

	return (
		<_AlertDialog.Root
			open={ effectiveOpen }
			onOpenChange={ handleOpenChange }
			onOpenChangeComplete={ handleOpenChangeComplete }
		>
			<AlertDialogContext.Provider value={ contextValue }>
				{ children }
			</AlertDialogContext.Provider>
		</_AlertDialog.Root>
	);
}

export { Root };
