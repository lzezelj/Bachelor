import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch }) => {
	let conditions;
	let categories;
	const cond = await fetch('http://localhost:3000/api/getConditions', {
		method: 'GET',
		credentials: 'include'
	});
	if (cond.ok) {
		const data = await cond.json();
		conditions = data.conditions;
	} else {
		console.error('Failed to fetch conditions');
	}
	const cat = await fetch('http://localhost:3000/api/getCategories', {
		method: 'GET',
		credentials: 'include'
	});
	if (cat.ok) {
		const data = await cat.json();
		categories = data.categories;
	} else {
		console.error('Failed to fetch conditions');
	}
	return { conditions, categories };
};
