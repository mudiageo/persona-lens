import type { RequestHandler } from './$types';
import { personaService } from '$lib/api';
import { json } from '@sveltejs/kit';

export const GET: RequestHandler = async () => {
	try {
		const testResult = await personaService.testAPIs();
		
		return json({
			success: testResult.success,
			data: testResult.data,
			message: testResult.message,
			timestamp: new Date().toISOString()
		});
	} catch (error) {
		return json({
			success: false,
			error: error instanceof Error ? error.message : 'Unknown error',
			timestamp: new Date().toISOString()
		}, { status: 500 });
	}
};
