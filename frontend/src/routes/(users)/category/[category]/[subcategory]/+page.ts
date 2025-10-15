import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, fetch }) => {
	let subcategory;
	if (params.subcategory === 'all') {
		subcategory = '';
	} else {
		subcategory = params.subcategory;
	}
	const res = await fetch(
		`http://localhost:3000/api/categoryListing?category=${params.category}&subcategory=${subcategory}`
	);

	if (!res.ok) {
		throw new Error('Listing not found');
	}

	const listing = await res.json();

	return {
		listing
	};
};
