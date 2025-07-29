import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
	return new Response(JSON.stringify({ 
		message: 'PersonaLens API is running',
		version: '1.0.0',
		endpoints: [
			'/api/personas',
			'/api/insights',
			'/api/analysis'
		]
	}), {
		headers: {
			'Content-Type': 'application/json'
		}
	});
};
