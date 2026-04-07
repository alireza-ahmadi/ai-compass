<script lang="ts">
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import Compass from '$lib/Compass.svelte';
	import ShareModal from '$lib/ShareModal.svelte';
	import { ITEMS } from '$lib/items';
	import { downloadPng } from '$lib/export';

	type Marker = { x: number; y: number } | null;

	// parse marker from a url. only called on the client — prerendering forbids
	// reading searchParams during ssr.
	function parseMarker(url: URL): Marker {
		const xs = url.searchParams.get('x');
		const ys = url.searchParams.get('y');
		if (xs === null || ys === null) return null;
		const x = Number(xs);
		const y = Number(ys);
		if (!Number.isFinite(x) || !Number.isFinite(y)) return null;
		return { x: Math.max(-100, Math.min(100, x)), y: Math.max(-100, Math.min(100, y)) };
	}

	// hydrate from url only on the client
	let marker = $state<Marker>(browser ? parseMarker(new URL(window.location.href)) : null);
	let showItems = $state(true);
	let modalOpen = $state(false);
	let compass: Compass | undefined = $state();

	// share url is derived from current marker (only meaningful when marker is set)
	let shareUrl = $derived.by(() => {
		if (typeof window === 'undefined') return '';
		if (!marker) return window.location.href;
		const u = new URL(window.location.href);
		u.searchParams.set('x', String(marker.x));
		u.searchParams.set('y', String(marker.y));
		return u.toString();
	});

	function handleMark(pos: { x: number; y: number }) {
		marker = pos;
		goto(resolve(`/?x=${pos.x}&y=${pos.y}`), {
			replaceState: true,
			noScroll: true,
			keepFocus: true
		});
		modalOpen = true;
	}

	function reset() {
		marker = null;
		modalOpen = false;
		goto(resolve('/'), { replaceState: true, noScroll: true, keepFocus: true });
	}

	async function onDownload() {
		const svg = compass?.getSvg();
		if (!svg) return;
		await downloadPng(svg, 'ai-compass.png', 2);
	}

	const TITLE = 'AI Compass';
	const DESCRIPTION = 'Where do you stand on AI? Place yourself on the compass and share.';
	const OG_IMAGE = '/og-image.png';
</script>

<svelte:head>
	<title>{TITLE}</title>
	<meta name="description" content={DESCRIPTION} />

	<!-- open graph -->
	<meta property="og:title" content={TITLE} />
	<meta property="og:description" content={DESCRIPTION} />
	<meta property="og:type" content="website" />
	<meta property="og:image" content={OG_IMAGE} />
	<meta property="og:url" content={page.url.href} />

	<!-- twitter / x -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={TITLE} />
	<meta name="twitter:description" content={DESCRIPTION} />
	<meta name="twitter:image" content={OG_IMAGE} />
</svelte:head>

<main class="min-h-screen bg-white px-4 py-8 sm:py-12">
	<div class="mx-auto max-w-4xl">
		<header class="mb-6 text-center">
			<h1 class="mb-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">AI Compass</h1>
			<p class="mt-2 text-sm leading-loose text-gray-700 sm:text-base">
				based on
				<a
					href="https://x.com/Noahpinion/status/2041462156936528339"
					target="_blank"
					rel="noopener noreferrer"
					class="underline decoration-gray-400 underline-offset-2 hover:text-gray-900 hover:decoration-gray-900"
				>
					noah smith's compass
				</a>
				<br />
				<span class="mt-2 block w-full bg-amber-100 p-1 font-semibold"
					>click anywhere to place yourself</span
				>
			</p>
		</header>

		<div class="mx-auto w-full">
			<Compass bind:this={compass} items={ITEMS} {showItems} {marker} onMark={handleMark} />
		</div>

		<div class="mx-auto mt-6 flex max-w-xs flex-col items-stretch gap-3">
			<label
				class="mb-2 flex cursor-pointer items-center justify-center gap-2 text-sm font-medium text-gray-700"
			>
				<input
					type="checkbox"
					checked={showItems}
					onchange={(e) => (showItems = (e.currentTarget as HTMLInputElement).checked)}
					class="h-4 w-4 rounded border-gray-400 text-gray-900 focus:ring-gray-500"
				/>
				show predefined positions
			</label>

			{#if marker}
				<button
					type="button"
					onclick={reset}
					class="w-full cursor-pointer border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-900 transition hover:bg-gray-100"
				>
					reset
				</button>
				<button
					type="button"
					onclick={() => (modalOpen = true)}
					class="w-full cursor-pointer bg-gray-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-gray-700"
				>
					share
				</button>
			{/if}

			<a
				href="https://github.com/alireza-ahmadi/ai-compass"
				target="_blank"
				rel="noopener noreferrer"
				aria-label="Star ai-compass on GitHub"
				class="mt-2 inline-flex items-center justify-center gap-2 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-100 hover:text-gray-900 sm:text-sm"
			>
				<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
					<path
						d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z"
					/>
				</svg>
				<span>Source Code on GitHub</span>
			</a>
		</div>
	</div>
</main>

<ShareModal
	open={modalOpen}
	{shareUrl}
	onClose={() => (modalOpen = false)}
	onChangePosition={() => (modalOpen = false)}
	{onDownload}
/>
