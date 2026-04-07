<script lang="ts">
	import type { CompassItem } from './items';

	type Marker = { x: number; y: number } | null;

	type Props = {
		items: CompassItem[];
		showItems: boolean;
		marker: Marker;
		onMark: (pos: { x: number; y: number }) => void;
	};

	let { items, showItems, marker, onMark }: Props = $props();

	// svg coords. viewBox accommodates the chart + padding for the axis labels.
	const VB_W = 900;
	const VB_H = 900;
	const PAD = 90; // space reserved for arrow heads + axis labels
	const CHART = { x: PAD, y: PAD, w: VB_W - PAD * 2, h: VB_H - PAD * 2 };
	const CX = CHART.x + CHART.w / 2;
	const CY = CHART.y + CHART.h / 2;

	// project [-100,100] coords -> svg coords
	function px(x: number): number {
		return CX + (x / 100) * (CHART.w / 2);
	}
	function py(y: number): number {
		// invert: positive y goes up
		return CY - (y / 100) * (CHART.h / 2);
	}

	// the bound svg element (used by the parent for png export)
	let svgEl: SVGSVGElement | undefined = $state();
	export function getSvg(): SVGSVGElement | undefined {
		return svgEl;
	}

	function handleClick(e: MouseEvent) {
		if (!svgEl) return;
		const pt = svgEl.createSVGPoint();
		pt.x = e.clientX;
		pt.y = e.clientY;
		const ctm = svgEl.getScreenCTM();
		if (!ctm) return;
		const local = pt.matrixTransform(ctm.inverse());
		// clamp to chart area
		const clampedX = Math.max(CHART.x, Math.min(CHART.x + CHART.w, local.x));
		const clampedY = Math.max(CHART.y, Math.min(CHART.y + CHART.h, local.y));
		// invert projection -> [-100,100]
		const x = ((clampedX - CX) / (CHART.w / 2)) * 100;
		const y = -((clampedY - CY) / (CHART.h / 2)) * 100;
		onMark({ x: Math.round(x), y: Math.round(y) });
	}

	function handleKey(e: KeyboardEvent) {
		// keyboard accessibility: enter/space drops marker at center
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			onMark({ x: 0, y: 0 });
		}
	}

	// quadrant rects
	const halfW = CHART.w / 2;
	const halfH = CHART.h / 2;
</script>

<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<svg
	bind:this={svgEl}
	viewBox="0 0 {VB_W} {VB_H}"
	xmlns="http://www.w3.org/2000/svg"
	role="application"
	aria-label="AI Compass: click to place yourself on the chart"
	tabindex="0"
	onclick={handleClick}
	onkeydown={handleKey}
	style="font-family: 'Google Sans', system-ui, sans-serif; cursor: crosshair; max-width: 100%; height: auto; display: block;"
>
	<defs>
		<marker
			id="arrow"
			viewBox="0 0 10 10"
			refX="9"
			refY="5"
			markerWidth="7"
			markerHeight="7"
			orient="auto-start-reverse"
		>
			<path d="M 0 0 L 10 5 L 0 10 z" fill="#111" />
		</marker>
		<filter id="markerShadow" x="-50%" y="-50%" width="200%" height="200%">
			<feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#000" flood-opacity="0.35" />
		</filter>
	</defs>

	<!-- white background so png export looks clean even outside the quadrants -->
	<rect x="0" y="0" width={VB_W} height={VB_H} fill="#ffffff" />

	<!-- four quadrants -->
	<rect x={CHART.x} y={CHART.y} width={halfW} height={halfH} fill="#F0BCBB" />
	<rect x={CHART.x + halfW} y={CHART.y} width={halfW} height={halfH} fill="#A1D7F4" />
	<rect x={CHART.x} y={CHART.y + halfH} width={halfW} height={halfH} fill="#CDE3C0" />
	<rect x={CHART.x + halfW} y={CHART.y + halfH} width={halfW} height={halfH} fill="#DCC7DE" />

	<!-- axes (drawn over the quadrants) -->
	<line
		x1={CHART.x - 20}
		y1={CY}
		x2={CHART.x + CHART.w + 20}
		y2={CY}
		stroke="#111"
		stroke-width="3"
		marker-start="url(#arrow)"
		marker-end="url(#arrow)"
	/>
	<line
		x1={CX}
		y1={CHART.y - 20}
		x2={CX}
		y2={CHART.y + CHART.h + 20}
		stroke="#111"
		stroke-width="3"
		marker-start="url(#arrow)"
		marker-end="url(#arrow)"
	/>

	<!-- axis labels -->
	<text x={CX} y={CHART.y - 40} text-anchor="middle" font-size="26" font-weight="700" fill="#111">
		Is worried about AI
	</text>
	<text
		x={CX}
		y={CHART.y + CHART.h + 60}
		text-anchor="middle"
		font-size="26"
		font-weight="700"
		fill="#111"
	>
		Isn't worried about AI
	</text>
	<text
		x={CHART.x - 30}
		y={CY + 38}
		text-anchor="start"
		font-size="22"
		font-weight="700"
		fill="#111"
	>
		Thinks AI doesn't work
	</text>
	<text
		x={CHART.x + CHART.w + 30}
		y={CY + 38}
		text-anchor="end"
		font-size="22"
		font-weight="700"
		fill="#111"
	>
		Thinks AI works
	</text>

	<!-- predefined positions -->
	{#if showItems}
		<g opacity="0.85">
			{#each items as item (item.id)}
				{@const lineHeight = 24}
				{@const startY = py(item.y) - ((item.label.length - 1) * lineHeight) / 2}
				<text
					x={px(item.x)}
					y={startY}
					text-anchor="middle"
					font-size="22"
					font-weight="600"
					fill="#1a1a1a"
				>
					{#each item.label as line, i (i)}
						<tspan x={px(item.x)} dy={i === 0 ? 0 : lineHeight}>{line}</tspan>
					{/each}
				</text>
			{/each}
		</g>
	{/if}

	<!-- user marker -->
	{#if marker}
		<g filter="url(#markerShadow)">
			<circle
				cx={px(marker.x)}
				cy={py(marker.y)}
				r="28"
				fill="#ff2d55"
				stroke="#ffffff"
				stroke-width="6"
			/>
			<text
				x={px(marker.x)}
				y={py(marker.y) - 44}
				text-anchor="middle"
				font-size="28"
				font-weight="700"
				fill="#111"
				stroke="#ffffff"
				stroke-width="5"
				paint-order="stroke fill"
			>
				Me
			</text>
		</g>
	{/if}
</svg>
