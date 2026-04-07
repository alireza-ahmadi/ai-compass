<script lang="ts">
	type Props = {
		open: boolean;
		shareUrl: string;
		onClose: () => void;
		onChangePosition: () => void;
		onDownload: () => void;
	};

	let { open, shareUrl, onClose, onChangePosition, onDownload }: Props = $props();

	let copied = $state(false);
	let copyTimer: ReturnType<typeof setTimeout> | undefined;
	let closeBtn: HTMLButtonElement | undefined = $state();

	async function copy() {
		try {
			await navigator.clipboard.writeText(shareUrl);
			copied = true;
			clearTimeout(copyTimer);
			copyTimer = setTimeout(() => (copied = false), 1800);
		} catch {
			// fallback: select the input
			const input = document.getElementById('share-url-input') as HTMLInputElement | null;
			input?.select();
		}
	}

	function handleKey(e: KeyboardEvent) {
		if (e.key === 'Escape') onClose();
	}

	$effect(() => {
		if (open) {
			copied = false;
			// focus the close button after the dialog renders
			queueMicrotask(() => closeBtn?.focus());
		}
	});
</script>

<svelte:window onkeydown={handleKey} />

{#if open}
	<!-- backdrop -->
	<button
		type="button"
		class="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
		aria-label="Close dialog"
		onclick={onClose}
	></button>

	<!-- dialog -->
	<div
		role="dialog"
		aria-modal="true"
		aria-labelledby="share-modal-title"
		class="pointer-events-none fixed inset-0 z-50 flex items-center justify-center p-4"
	>
		<div
			class="pointer-events-auto w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
			style="font-family: 'Google Sans', system-ui, sans-serif;"
		>
			<div class="mb-4 flex items-start justify-between gap-4">
				<h2 id="share-modal-title" class="text-2xl font-bold text-gray-900">
					you're on the compass!
				</h2>
				<button
					bind:this={closeBtn}
					type="button"
					onclick={onClose}
					aria-label="Close"
					class="-m-2 rounded-full p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
				>
					<svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
						<path
							d="M5 5l10 10M15 5L5 15"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
						/>
					</svg>
				</button>
			</div>

			<p class="mb-4 text-sm text-gray-600">
				share your spot, or click anywhere on the compass to move it.
			</p>

			<label for="share-url-input" class="mb-1 block text-xs font-medium text-gray-500">
				share link
			</label>
			<div class="mb-4 flex gap-2">
				<input
					id="share-url-input"
					type="text"
					readonly
					value={shareUrl}
					class="flex-1 rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-800 focus:border-gray-500 focus:outline-none"
					onclick={(e) => (e.currentTarget as HTMLInputElement).select()}
				/>
				<button
					type="button"
					onclick={copy}
					class="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-700"
				>
					{copied ? 'copied!' : 'copy'}
				</button>
			</div>

			<div class="flex flex-col gap-2 sm:flex-row">
				<button
					type="button"
					onclick={onDownload}
					class="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-900 transition hover:bg-gray-100"
				>
					download png
				</button>
				<button
					type="button"
					onclick={onChangePosition}
					class="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-900 transition hover:bg-gray-100"
				>
					change position
				</button>
			</div>
		</div>
	</div>
{/if}
