export function countListings(listings: any[]) {
	let allListings = listings.filter((listing) => listing.is_sold === 0);
	const counts: Record<string, { total: number; subcategories: Record<string, number> }> = {};
	for (const listing of allListings) {
		if (!counts[listing.category]) {
			counts[listing.category] = { total: 0, subcategories: {} };
		}
		counts[listing.category].total++;
		if (listing.subcategory) {
			counts[listing.category].subcategories[listing.subcategory] =
				(counts[listing.category].subcategories[listing.subcategory] || 0) + 1;
		}
	}
	return counts;
}

export async function fetchSubcategories(fetch: typeof globalThis.fetch, category: string) {
	const res = await fetch('http://localhost:3000/api/getSubcategories', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ category }),
		credentials: 'include'
	});

	if (!res.ok) throw new Error(`Failed to fetch subcategories for ${category}`);
	const data = await res.json();
	return data.subcategories;
}

export function formatDate(listings: any[]) {
	for (let i = 0; i < listings.length; i++) {
		const date = new Date(listings[i].created_at);
		const day = String(date.getUTCDate()).padStart(2, '0');
		const month = String(date.getUTCMonth() + 1).padStart(2, '0');
		const year = date.getUTCFullYear();
		const formattedDate = `${day}.${month}.${year}`;
		listings[i].created_at = formattedDate;
	}
	return listings;
}
