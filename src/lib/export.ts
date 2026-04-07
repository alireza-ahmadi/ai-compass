// download an svg element as a png file.
// no deps — serializes the svg, draws it on a canvas, and triggers a download.

export async function downloadPng(
	svgEl: SVGSVGElement,
	filename: string,
	scale = 2
): Promise<void> {
	const vb = svgEl.viewBox.baseVal;
	const width = vb && vb.width ? vb.width : svgEl.clientWidth;
	const height = vb && vb.height ? vb.height : svgEl.clientHeight;

	// clone so we can ensure xmlns is present without mutating the live node
	const clone = svgEl.cloneNode(true) as SVGSVGElement;
	if (!clone.getAttribute('xmlns')) clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
	if (!clone.getAttribute('xmlns:xlink'))
		clone.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
	clone.setAttribute('width', String(width));
	clone.setAttribute('height', String(height));

	const xml = new XMLSerializer().serializeToString(clone);
	// utf-8 safe data url
	const svg64 = btoa(unescape(encodeURIComponent(xml)));
	const dataUrl = `data:image/svg+xml;base64,${svg64}`;

	const img = new Image();
	img.crossOrigin = 'anonymous';
	await new Promise<void>((resolve, reject) => {
		img.onload = () => resolve();
		img.onerror = (e) => reject(e);
		img.src = dataUrl;
	});

	const canvas = document.createElement('canvas');
	canvas.width = Math.round(width * scale);
	canvas.height = Math.round(height * scale);
	const ctx = canvas.getContext('2d');
	if (!ctx) throw new Error('canvas 2d context unavailable');
	ctx.fillStyle = '#ffffff';
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

	const blob = await new Promise<Blob | null>((resolve) =>
		canvas.toBlob((b) => resolve(b), 'image/png')
	);
	if (!blob) throw new Error('failed to create png blob');

	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = filename.endsWith('.png') ? filename : `${filename}.png`;
	document.body.appendChild(a);
	a.click();
	a.remove();
	URL.revokeObjectURL(url);
}
