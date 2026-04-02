import { AlertDialog as _AlertDialog } from '@base-ui/react/alert-dialog';
import clsx from 'clsx';
import { forwardRef, useContext, useCallback } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import {
	type ThemeProvider as ThemeProviderType,
	privateApis as themePrivateApis,
} from '@wordpress/theme';

import { Button } from '../button';
import dialogStyles from '../dialog/style.module.css';
import { unlock } from '../lock-unlock';
import { Stack } from '../stack';
import { Text } from '../text';
import { AlertDialogContext } from './context';
import alertDialogStyles from './style.module.css';
import type { PopupProps } from './types';

const ThemeProvider: typeof ThemeProviderType =
	unlock( themePrivateApis ).ThemeProvider;

const Popup = forwardRef< HTMLDivElement, PopupProps >(
	function AlertDialogPopup(
		{
			className,
			intent = 'default',
			title,
			description,
			children,
			onConfirm,
			confirmButtonText = __( 'OK' ),
			cancelButtonText = __( 'Cancel' ),
			...props
		},
		ref
	) {
		const ctx = useContext( AlertDialogContext );

		const handleConfirm = useCallback( () => {
			ctx.confirm( onConfirm );
		}, [ ctx, onConfirm ] );

		const confirmClassName =
			intent === 'irreversible'
				? alertDialogStyles[ 'irreversible-action' ]
				: undefined;

		const buttonsDisabled = ctx.phase !== 'idle' || undefined;

		return (
			<_AlertDialog.Portal>
				<_AlertDialog.Backdrop className={ dialogStyles.backdrop } />
				<ThemeProvider>
					<_AlertDialog.Popup
						ref={ ref }
						className={ clsx(
							dialogStyles.popup,
							className,
							dialogStyles[ 'is-medium' ]
						) }
						{ ...props }
					>
						<Stack
							direction="column"
							gap="sm"
							className={ alertDialogStyles.header }
						>
							<Text
								variant="heading-xl"
								render={ <_AlertDialog.Title /> }
								className={ dialogStyles.title }
							>
								{ title }
							</Text>
							{ description && (
								<Text
									variant="body-md"
									render={ <_AlertDialog.Description /> }
								>
									{ description }
								</Text>
							) }
						</Stack>
						{ children }
						<div className={ dialogStyles.footer }>
							<_AlertDialog.Close
								render={ <Button variant="minimal" /> }
								disabled={ buttonsDisabled }
							>
								{ cancelButtonText }
							</_AlertDialog.Close>
							<Button
								className={ confirmClassName }
								onClick={ handleConfirm }
								loading={ ctx.showSpinner || undefined }
								disabled={ buttonsDisabled }
							>
								{ confirmButtonText }
							</Button>
						</div>
					</_AlertDialog.Popup>
				</ThemeProvider>
			</_AlertDialog.Portal>
		);
	}
);

export { Popup };
