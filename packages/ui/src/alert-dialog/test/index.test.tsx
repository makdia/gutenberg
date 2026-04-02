import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from '@wordpress/element';

import * as AlertDialog from '..';
import type { ConfirmResult } from '../types';

function createDeferred() {
	let resolve!: ( value?: ConfirmResult ) => void;
	let reject!: ( reason?: unknown ) => void;
	const promise = new Promise< ConfirmResult >( ( res, rej ) => {
		resolve = res;
		reject = rej;
	} );
	return { promise, resolve, reject };
}

describe( 'AlertDialog', () => {
	it( 'forwards ref', () => {
		const triggerRef = createRef< HTMLButtonElement >();
		const popupRef = createRef< HTMLDivElement >();

		render(
			<AlertDialog.Root defaultOpen>
				<AlertDialog.Trigger ref={ triggerRef }>
					Open
				</AlertDialog.Trigger>
				<AlertDialog.Popup ref={ popupRef } title="Test Title">
					Content
				</AlertDialog.Popup>
			</AlertDialog.Root>
		);

		expect( triggerRef.current ).toBeInstanceOf( HTMLButtonElement );
		expect( popupRef.current ).toBeInstanceOf( HTMLDivElement );
	} );

	it( 'renders with title, children, and default buttons', async () => {
		render(
			<AlertDialog.Root open onOpenChange={ jest.fn() }>
				<AlertDialog.Popup title="Test Title">
					Test message content
				</AlertDialog.Popup>
			</AlertDialog.Root>
		);

		await waitFor( () => {
			expect( screen.getByText( 'Test Title' ) ).toBeVisible();
		} );

		expect( screen.getByText( 'Test message content' ) ).toBeVisible();
		expect(
			screen.queryByRole( 'button', { name: 'Close' } )
		).not.toBeInTheDocument();
		expect( screen.getByRole( 'button', { name: 'OK' } ) ).toBeVisible();
		expect(
			screen.getByRole( 'button', { name: 'Cancel' } )
		).toBeVisible();
	} );

	it( 'renders description when provided', async () => {
		render(
			<AlertDialog.Root open onOpenChange={ jest.fn() }>
				<AlertDialog.Popup
					title="Test Title"
					description="This is a description"
				>
					Body content
				</AlertDialog.Popup>
			</AlertDialog.Root>
		);

		await waitFor( () => {
			expect( screen.getByText( 'This is a description' ) ).toBeVisible();
		} );
	} );

	it( 'renders with role="alertdialog" for default intent', async () => {
		render(
			<AlertDialog.Root open onOpenChange={ jest.fn() }>
				<AlertDialog.Popup title="Default Dialog">
					Content
				</AlertDialog.Popup>
			</AlertDialog.Root>
		);

		await waitFor( () => {
			expect( screen.getByRole( 'alertdialog' ) ).toBeVisible();
		} );
	} );

	it( 'renders with role="alertdialog" for irreversible intent', async () => {
		render(
			<AlertDialog.Root open onOpenChange={ jest.fn() }>
				<AlertDialog.Popup
					intent="irreversible"
					title="Irreversible Dialog"
				>
					Content
				</AlertDialog.Popup>
			</AlertDialog.Root>
		);

		await waitFor( () => {
			expect( screen.getByRole( 'alertdialog' ) ).toBeVisible();
		} );
	} );

	it( 'uses custom button labels', async () => {
		render(
			<AlertDialog.Root open onOpenChange={ jest.fn() }>
				<AlertDialog.Popup
					title="Custom Labels"
					confirmButtonText="Yes, do it"
					cancelButtonText="No, go back"
				>
					Content
				</AlertDialog.Popup>
			</AlertDialog.Root>
		);

		await waitFor( () => {
			expect(
				screen.getByRole( 'button', { name: 'Yes, do it' } )
			).toBeVisible();
		} );

		expect(
			screen.getByRole( 'button', { name: 'No, go back' } )
		).toBeVisible();
	} );

	it( 'opens dialog when Trigger is clicked', async () => {
		render(
			<AlertDialog.Root>
				<AlertDialog.Trigger>Open</AlertDialog.Trigger>
				<AlertDialog.Popup title="Trigger Test">
					Dialog content
				</AlertDialog.Popup>
			</AlertDialog.Root>
		);

		expect(
			screen.queryByText( 'Dialog content' )
		).not.toBeInTheDocument();

		await userEvent.click( screen.getByRole( 'button', { name: 'Open' } ) );

		await waitFor( () => {
			expect( screen.getByText( 'Trigger Test' ) ).toBeVisible();
		} );

		expect( screen.getByText( 'Dialog content' ) ).toBeVisible();
	} );

	describe( 'sync confirm flow', () => {
		it( 'calls onConfirm and closes on confirm click', async () => {
			const onConfirm = jest.fn();
			const onOpenChange = jest.fn();

			render(
				<AlertDialog.Root
					open
					onOpenChange={ onOpenChange }
					onConfirm={ onConfirm }
				>
					<AlertDialog.Popup title="Sync Test">
						Content
					</AlertDialog.Popup>
				</AlertDialog.Root>
			);

			await waitFor( () => {
				expect(
					screen.getByRole( 'button', { name: 'OK' } )
				).toBeVisible();
			} );

			await userEvent.click(
				screen.getByRole( 'button', { name: 'OK' } )
			);

			expect( onConfirm ).toHaveBeenCalledTimes( 1 );
			await waitFor( () => {
				expect( onOpenChange ).toHaveBeenCalledWith(
					false,
					expect.objectContaining( { reason: 'close-press' } )
				);
			} );
		} );

		it( 'closes without onConfirm when no handler is provided', async () => {
			const onOpenChange = jest.fn();

			render(
				<AlertDialog.Root open onOpenChange={ onOpenChange }>
					<AlertDialog.Popup title="No Handler">
						Content
					</AlertDialog.Popup>
				</AlertDialog.Root>
			);

			await waitFor( () => {
				expect(
					screen.getByRole( 'button', { name: 'OK' } )
				).toBeVisible();
			} );

			await userEvent.click(
				screen.getByRole( 'button', { name: 'OK' } )
			);

			await waitFor( () => {
				expect( onOpenChange ).toHaveBeenCalledWith(
					false,
					expect.objectContaining( { reason: 'close-press' } )
				);
			} );
		} );
	} );

	describe( 'cancel and dismiss', () => {
		it( 'closes on cancel click without calling onConfirm', async () => {
			const onConfirm = jest.fn();
			const onOpenChange = jest.fn();

			render(
				<AlertDialog.Root
					open
					onOpenChange={ onOpenChange }
					onConfirm={ onConfirm }
				>
					<AlertDialog.Popup title="Cancel Test">
						Content
					</AlertDialog.Popup>
				</AlertDialog.Root>
			);

			await waitFor( () => {
				expect(
					screen.getByRole( 'button', { name: 'Cancel' } )
				).toBeVisible();
			} );

			await userEvent.click(
				screen.getByRole( 'button', { name: 'Cancel' } )
			);

			expect( onOpenChange ).toHaveBeenCalledWith(
				false,
				expect.objectContaining( { reason: 'close-press' } )
			);
			expect( onConfirm ).not.toHaveBeenCalled();
		} );

		it( 'closes on escape key', async () => {
			const onOpenChange = jest.fn();

			render(
				<AlertDialog.Root open onOpenChange={ onOpenChange }>
					<AlertDialog.Popup title="Escape Test">
						Content
					</AlertDialog.Popup>
				</AlertDialog.Root>
			);

			await waitFor( () => {
				expect( screen.getByText( 'Escape Test' ) ).toBeVisible();
			} );

			await userEvent.keyboard( '{Escape}' );

			expect( onOpenChange ).toHaveBeenCalledWith(
				false,
				expect.objectContaining( { reason: 'escape-key' } )
			);
		} );

		it( 'does not close on backdrop click', async () => {
			const onOpenChange = jest.fn();

			render(
				<AlertDialog.Root open onOpenChange={ onOpenChange }>
					<AlertDialog.Popup title="Backdrop Test">
						Content
					</AlertDialog.Popup>
				</AlertDialog.Root>
			);

			await waitFor( () => {
				expect( screen.getByText( 'Backdrop Test' ) ).toBeVisible();
			} );

			await userEvent.click( document.body );

			expect( onOpenChange ).not.toHaveBeenCalled();
		} );
	} );

	describe( 'irreversible intent', () => {
		it( 'renders title and buttons', async () => {
			render(
				<AlertDialog.Root open onOpenChange={ jest.fn() }>
					<AlertDialog.Popup
						intent="irreversible"
						title="Irreversible Dialog"
					>
						Irreversible message content
					</AlertDialog.Popup>
				</AlertDialog.Root>
			);

			await waitFor( () => {
				expect(
					screen.getByText( 'Irreversible Dialog' )
				).toBeVisible();
			} );

			expect(
				screen.getByText( 'Irreversible message content' )
			).toBeVisible();
			expect(
				screen.getByRole( 'button', { name: 'OK' } )
			).toBeVisible();
			expect(
				screen.getByRole( 'button', { name: 'Cancel' } )
			).toBeVisible();
		} );

		it( 'closes on escape key', async () => {
			const onOpenChange = jest.fn();

			render(
				<AlertDialog.Root open onOpenChange={ onOpenChange }>
					<AlertDialog.Popup
						intent="irreversible"
						title="Irreversible Dialog"
					>
						Content
					</AlertDialog.Popup>
				</AlertDialog.Root>
			);

			await waitFor( () => {
				expect(
					screen.getByText( 'Irreversible Dialog' )
				).toBeVisible();
			} );

			await userEvent.keyboard( '{Escape}' );

			expect( onOpenChange ).toHaveBeenCalledWith(
				false,
				expect.objectContaining( { reason: 'escape-key' } )
			);
		} );

		it( 'does not close on backdrop click', async () => {
			const onOpenChange = jest.fn();

			render(
				<AlertDialog.Root open onOpenChange={ onOpenChange }>
					<AlertDialog.Popup
						intent="irreversible"
						title="Irreversible Dialog"
					>
						Content
					</AlertDialog.Popup>
				</AlertDialog.Root>
			);

			await waitFor( () => {
				expect(
					screen.getByText( 'Irreversible Dialog' )
				).toBeVisible();
			} );

			await userEvent.click( document.body );

			expect( onOpenChange ).not.toHaveBeenCalled();
		} );
	} );

	describe( 'async confirm flow', () => {
		it( 'disables buttons while confirm is pending', async () => {
			const deferred = createDeferred();

			render(
				<AlertDialog.Root
					open
					onOpenChange={ jest.fn() }
					onConfirm={ () => deferred.promise }
				>
					<AlertDialog.Popup title="Async Test">
						Content
					</AlertDialog.Popup>
				</AlertDialog.Root>
			);

			await waitFor( () => {
				expect(
					screen.getByRole( 'button', { name: 'OK' } )
				).toBeVisible();
			} );

			await userEvent.click(
				screen.getByRole( 'button', { name: 'OK' } )
			);

			await waitFor( () => {
				expect(
					screen.getByRole( 'button', { name: 'OK' } )
				).toHaveAttribute( 'aria-disabled', 'true' );
			} );

			expect(
				screen.getByRole( 'button', { name: 'Cancel' } )
			).toHaveAttribute( 'aria-disabled', 'true' );

			await act( async () => {
				deferred.resolve();
			} );
		} );

		it( 'closes dialog when async confirm resolves', async () => {
			const deferred = createDeferred();
			const onOpenChange = jest.fn();

			render(
				<AlertDialog.Root
					open
					onOpenChange={ onOpenChange }
					onConfirm={ () => deferred.promise }
				>
					<AlertDialog.Popup title="Async Resolve">
						Content
					</AlertDialog.Popup>
				</AlertDialog.Root>
			);

			await waitFor( () => {
				expect(
					screen.getByRole( 'button', { name: 'OK' } )
				).toBeVisible();
			} );

			await userEvent.click(
				screen.getByRole( 'button', { name: 'OK' } )
			);

			await act( async () => {
				deferred.resolve();
			} );

			await waitFor( () => {
				expect( onOpenChange ).toHaveBeenCalledWith(
					false,
					expect.objectContaining( { reason: 'close-press' } )
				);
			} );
		} );

		it( 're-enables buttons when async confirm rejects (task failure)', async () => {
			const deferred = createDeferred();

			render(
				<AlertDialog.Root
					open
					onOpenChange={ jest.fn() }
					onConfirm={ () => deferred.promise }
				>
					<AlertDialog.Popup title="Async Reject">
						Content
					</AlertDialog.Popup>
				</AlertDialog.Root>
			);

			await waitFor( () => {
				expect(
					screen.getByRole( 'button', { name: 'OK' } )
				).toBeVisible();
			} );

			await userEvent.click(
				screen.getByRole( 'button', { name: 'OK' } )
			);

			await waitFor( () => {
				expect(
					screen.getByRole( 'button', { name: 'OK' } )
				).toHaveAttribute( 'aria-disabled', 'true' );
			} );

			await act( async () => {
				deferred.reject( new Error( 'Task failed' ) );
			} );

			await waitFor( () => {
				expect(
					screen.getByRole( 'button', { name: 'OK' } )
				).not.toHaveAttribute( 'aria-disabled', 'true' );
			} );

			expect(
				screen.getByRole( 'button', { name: 'Cancel' } )
			).not.toHaveAttribute( 'aria-disabled', 'true' );

			expect( screen.getByText( 'Async Reject' ) ).toBeVisible();
		} );

		it( 'keeps dialog open when confirm returns { close: false }', async () => {
			const onOpenChange = jest.fn();

			render(
				<AlertDialog.Root
					open
					onOpenChange={ onOpenChange }
					onConfirm={ () => ( { close: false } ) }
				>
					<AlertDialog.Popup title="Keep Open">
						Content
					</AlertDialog.Popup>
				</AlertDialog.Root>
			);

			await waitFor( () => {
				expect(
					screen.getByRole( 'button', { name: 'OK' } )
				).toBeVisible();
			} );

			await userEvent.click(
				screen.getByRole( 'button', { name: 'OK' } )
			);

			await waitFor( () => {
				expect(
					screen.getByRole( 'button', { name: 'OK' } )
				).not.toHaveAttribute( 'aria-disabled', 'true' );
			} );

			expect( onOpenChange ).not.toHaveBeenCalledWith(
				false,
				expect.anything()
			);
			expect( screen.getByText( 'Keep Open' ) ).toBeVisible();
		} );

		it( 'keeps dialog open when async confirm returns { close: false }', async () => {
			const deferred = createDeferred();
			const onOpenChange = jest.fn();

			render(
				<AlertDialog.Root
					open
					onOpenChange={ onOpenChange }
					onConfirm={ () => deferred.promise }
				>
					<AlertDialog.Popup title="Async Keep Open">
						Content
					</AlertDialog.Popup>
				</AlertDialog.Root>
			);

			await waitFor( () => {
				expect(
					screen.getByRole( 'button', { name: 'OK' } )
				).toBeVisible();
			} );

			await userEvent.click(
				screen.getByRole( 'button', { name: 'OK' } )
			);

			await waitFor( () => {
				expect(
					screen.getByRole( 'button', { name: 'OK' } )
				).toHaveAttribute( 'aria-disabled', 'true' );
			} );

			await act( async () => {
				deferred.resolve( { close: false } );
			} );

			await waitFor( () => {
				expect(
					screen.getByRole( 'button', { name: 'OK' } )
				).not.toHaveAttribute( 'aria-disabled', 'true' );
			} );

			expect( onOpenChange ).not.toHaveBeenCalledWith(
				false,
				expect.anything()
			);
		} );

		it( 'blocks dismiss while pending by default', async () => {
			const deferred = createDeferred();
			const onOpenChange = jest.fn();

			render(
				<AlertDialog.Root
					open
					onOpenChange={ onOpenChange }
					onConfirm={ () => deferred.promise }
				>
					<AlertDialog.Popup title="Block Dismiss">
						Content
					</AlertDialog.Popup>
				</AlertDialog.Root>
			);

			await waitFor( () => {
				expect(
					screen.getByRole( 'button', { name: 'OK' } )
				).toBeVisible();
			} );

			await userEvent.click(
				screen.getByRole( 'button', { name: 'OK' } )
			);

			await waitFor( () => {
				expect(
					screen.getByRole( 'button', { name: 'OK' } )
				).toHaveAttribute( 'aria-disabled', 'true' );
			} );

			await userEvent.keyboard( '{Escape}' );

			expect( onOpenChange ).not.toHaveBeenCalledWith(
				false,
				expect.anything()
			);

			await act( async () => {
				deferred.resolve();
			} );
		} );

		it( 'allows dismiss while pending with allowDismissWhilePending', async () => {
			const deferred = createDeferred();
			const onOpenChange = jest.fn();

			render(
				<AlertDialog.Root
					open
					onOpenChange={ onOpenChange }
					onConfirm={ () => deferred.promise }
					allowDismissWhilePending
				>
					<AlertDialog.Popup title="Allow Dismiss">
						Content
					</AlertDialog.Popup>
				</AlertDialog.Root>
			);

			await waitFor( () => {
				expect(
					screen.getByRole( 'button', { name: 'OK' } )
				).toBeVisible();
			} );

			await userEvent.click(
				screen.getByRole( 'button', { name: 'OK' } )
			);

			await waitFor( () => {
				expect(
					screen.getByRole( 'button', { name: 'OK' } )
				).toHaveAttribute( 'aria-disabled', 'true' );
			} );

			await userEvent.keyboard( '{Escape}' );

			expect( onOpenChange ).toHaveBeenCalledWith(
				false,
				expect.objectContaining( { reason: 'escape-key' } )
			);

			await act( async () => {
				deferred.resolve();
			} );
		} );

		it( 'ignores duplicate confirm clicks while pending', async () => {
			const onConfirm = jest.fn(
				() =>
					new Promise< void >( () => {
						// Never resolves
					} )
			);

			render(
				<AlertDialog.Root
					open
					onOpenChange={ jest.fn() }
					onConfirm={ onConfirm }
				>
					<AlertDialog.Popup title="Double Click">
						Content
					</AlertDialog.Popup>
				</AlertDialog.Root>
			);

			await waitFor( () => {
				expect(
					screen.getByRole( 'button', { name: 'OK' } )
				).toBeVisible();
			} );

			await userEvent.click(
				screen.getByRole( 'button', { name: 'OK' } )
			);
			await userEvent.click(
				screen.getByRole( 'button', { name: 'OK' } )
			);

			expect( onConfirm ).toHaveBeenCalledTimes( 1 );
		} );
	} );

	describe( 'Popup onConfirm override', () => {
		it( 'uses Popup onConfirm over Root onConfirm', async () => {
			const rootConfirm = jest.fn();
			const popupConfirm = jest.fn();

			render(
				<AlertDialog.Root
					open
					onOpenChange={ jest.fn() }
					onConfirm={ rootConfirm }
				>
					<AlertDialog.Popup
						title="Override Test"
						onConfirm={ popupConfirm }
					>
						Content
					</AlertDialog.Popup>
				</AlertDialog.Root>
			);

			await waitFor( () => {
				expect(
					screen.getByRole( 'button', { name: 'OK' } )
				).toBeVisible();
			} );

			await userEvent.click(
				screen.getByRole( 'button', { name: 'OK' } )
			);

			await waitFor( () => {
				expect( popupConfirm ).toHaveBeenCalledTimes( 1 );
			} );
			expect( rootConfirm ).not.toHaveBeenCalled();
		} );
	} );

	describe( 'uncontrolled mode', () => {
		it( 'opens and closes via internal state', async () => {
			const onConfirm = jest.fn();

			render(
				<AlertDialog.Root onConfirm={ onConfirm }>
					<AlertDialog.Trigger>Open</AlertDialog.Trigger>
					<AlertDialog.Popup title="Uncontrolled">
						Content
					</AlertDialog.Popup>
				</AlertDialog.Root>
			);

			expect( screen.queryByText( 'Content' ) ).not.toBeInTheDocument();

			await userEvent.click(
				screen.getByRole( 'button', { name: 'Open' } )
			);

			await waitFor( () => {
				expect( screen.getByText( 'Uncontrolled' ) ).toBeVisible();
			} );

			await userEvent.click(
				screen.getByRole( 'button', { name: 'Cancel' } )
			);

			await waitFor( () => {
				expect(
					screen.queryByText( 'Uncontrolled' )
				).not.toBeInTheDocument();
			} );
		} );
	} );
} );
