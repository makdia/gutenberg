import type { AlertDialog as _AlertDialog } from '@base-ui/react/alert-dialog';
import type { ReactNode } from 'react';

import type { ComponentProps } from '../utils/types';

/**
 * The return type of `onConfirm`. Return `void` (or nothing) to auto-close
 * the dialog after the confirm handler completes. Return `{ close: false }`
 * to keep the dialog open (e.g. for validation errors).
 */
export type ConfirmResult = void | { close?: boolean };

export interface RootProps
	extends Pick<
		_AlertDialog.Root.Props,
		'open' | 'onOpenChange' | 'defaultOpen'
	> {
	/**
	 * The content to be rendered inside the component. Typically includes
	 * `AlertDialog.Trigger` and `AlertDialog.Popup`.
	 */
	children: ReactNode;

	/**
	 * Callback fired when the user confirms the action.
	 *
	 * - Synchronous handlers: the dialog closes immediately after the
	 *   handler returns.
	 * - Async handlers: the dialog enters a "pending" state (buttons
	 *   disabled, spinner shown on the confirm button) until the promise
	 *   settles.
	 *
	 * Return `{ close: false }` to keep the dialog open after the handler
	 * completes (e.g. for server-side validation). Return `void` or
	 * `{ close: true }` to close the dialog (the default).
	 *
	 * If the promise rejects (or the handler throws), the dialog stays
	 * open and returns to idle. The consumer can display error UI via
	 * `Popup`'s `children`.
	 */
	onConfirm?: () => ConfirmResult | Promise< ConfirmResult >;

	/**
	 * Whether to allow dismissing the dialog (via Escape key or cancel
	 * button) while the confirm action is pending.
	 *
	 * @default false
	 */
	allowDismissWhilePending?: boolean;
}

export interface TriggerProps extends ComponentProps< 'button' > {
	/**
	 * The content to be rendered inside the component.
	 */
	children?: ReactNode;
}

export interface PopupProps
	extends Omit< ComponentProps< 'div' >, 'title' >,
		Pick< _AlertDialog.Popup.Props, 'initialFocus' | 'finalFocus' > {
	/**
	 * The semantic intent of the dialog, which determines its styling.
	 *
	 * All intents use `role="alertdialog"`, are always modal, and block
	 * backdrop click dismissal. Escape key and the cancel/confirm buttons
	 * still dismiss the dialog.
	 *
	 * - `'default'`: Standard confirmation dialog for reversible actions.
	 * - `'irreversible'`: Confirmation dialog for irreversible actions that
	 *   cannot be undone. The confirm button uses error/danger coloring.
	 *
	 * @default 'default'
	 */
	intent?: 'default' | 'irreversible';

	/**
	 * The title displayed in the dialog header. This serves as both the
	 * visible heading and the accessible label for the dialog.
	 */
	title: ReactNode;

	/**
	 * An optional description displayed below the title. Rendered using
	 * Base UI's `AlertDialog.Description` for proper accessibility
	 * association with the dialog.
	 */
	description?: ReactNode;

	/**
	 * Optional body content displayed between the description and the
	 * action buttons. Use for additional context, form fields, or
	 * error messages.
	 */
	children?: ReactNode;

	/**
	 * Custom text for the confirm button.
	 *
	 * @default 'OK'
	 */
	confirmButtonText?: ReactNode;

	/**
	 * Custom text for the cancel button.
	 *
	 * @default 'Cancel'
	 */
	cancelButtonText?: ReactNode;

	/**
	 * Callback fired when the user confirms the action.
	 * Overrides the `onConfirm` provided on `Root` when set.
	 */
	onConfirm?: () => ConfirmResult | Promise< ConfirmResult >;
}
