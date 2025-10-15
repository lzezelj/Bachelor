import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, fetch }) => {
	const res = await fetch(`http://localhost:3000/api/getListing?id=${params.id}`);

	if (!res.ok) {
		throw new Error('Listing not found');
	}

	const listing = await res.json();

	return {
		listing
	};
};
