// predefined items shown on the compass.
// coordinates are in [-100, 100] space:
//   x: -100 = "thinks ai doesn't work", +100 = "thinks ai works"
//   y: -100 = "isn't worried about ai", +100 = "is worried about ai"
//
// label is an array — each entry renders on its own line.

export type Quadrant = 'tl' | 'tr' | 'bl' | 'br';

export type CompassItem = {
	id: string;
	label: string[];
	x: number;
	y: number;
	quadrant: Quadrant;
};

export const ITEMS: CompassItem[] = [
	// top-left: worried + doesn't work
	{ id: 'artists', label: ['Artists'], x: -35, y: 80, quadrant: 'tl' },
	{
		id: 'bluesky',
		label: ['Bluesky', 'progressives'],
		x: -60,
		y: 45,
		quadrant: 'tl'
	},

	// top-right: worried + works
	{ id: 'eas', label: ['EAs'], x: 50, y: 65, quadrant: 'tr' },
	{
		id: 'ai-safety',
		label: ['AI safety people'],
		x: 55,
		y: 40,
		quadrant: 'tr'
	},
	{ id: 'anthropic', label: ['Anthropic'], x: 75, y: 8, quadrant: 'tr' },

	// bottom-left: not worried + doesn't work
	{
		id: 'not-paying-attention',
		label: ['People who', "aren't paying", 'attention'],
		x: -70,
		y: -55,
		quadrant: 'bl'
	},
	{
		id: 'ai-for-science',
		label: ['"AI for science"', 'people'],
		x: -30,
		y: -90,
		quadrant: 'bl'
	},

	// bottom-right: not worried + works
	{
		id: 'andreessen',
		label: ['Marc Andreessen'],
		x: 45,
		y: -35,
		quadrant: 'br'
	},
	{ id: 'openai', label: ['OpenAI'], x: 75, y: -55, quadrant: 'br' },
	{ id: 'eacc', label: ['e/acc'], x: 55, y: -80, quadrant: 'br' }
];
