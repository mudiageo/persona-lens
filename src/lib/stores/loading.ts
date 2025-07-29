import { writable } from 'svelte/store';
import type { LoadingState } from '$lib/types/api';

// Global loading states for different API operations
export const apiLoadingStates = writable<Record<string, LoadingState>>({});

// Helper functions
export function setLoadingState(key: string, state: Partial<LoadingState>) {
	apiLoadingStates.update(states => ({
		...states,
		[key]: {
			isLoading: false,
			error: null,
			...states[key],
			...state
		}
	}));
}

export function clearLoadingState(key: string) {
	apiLoadingStates.update(states => {
		const newStates = { ...states };
		delete newStates[key];
		return newStates;
	});
}

export function getLoadingState(key: string): LoadingState {
	let currentState: LoadingState = { isLoading: false, error: null };
	
	apiLoadingStates.subscribe(states => {
		currentState = states[key] || { isLoading: false, error: null };
	})();
	
	return currentState;
}

// Specific stores for common operations
export const personaGenerationState = writable<LoadingState>({
	isLoading: false,
	error: null
});

export const apiTestState = writable<LoadingState>({
	isLoading: false,
	error: null
});
