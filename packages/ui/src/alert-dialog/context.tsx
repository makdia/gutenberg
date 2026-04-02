import { createContext } from '@wordpress/element';

import type { ConfirmResult } from './types';

type Phase = 'idle' | 'pending' | 'closing';

type ConfirmHandler = () => ConfirmResult | Promise< ConfirmResult >;

interface AlertDialogContextValue {
	phase: Phase;
	showSpinner: boolean;
	confirm: ( overrideHandler?: ConfirmHandler ) => Promise< void >;
}

const noop = async () => {};

const AlertDialogContext = createContext< AlertDialogContextValue >( {
	phase: 'idle',
	showSpinner: false,
	confirm: noop,
} );

export { AlertDialogContext };
export type { Phase, ConfirmHandler };
