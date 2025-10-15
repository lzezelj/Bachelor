<script lang="ts">
	import ListingGrid from '$lib/ListingGrid.svelte';
	import { onMount } from 'svelte';
	let { data } = $props();
	let user_id = data.user.data.id;
	let currentPage = 'purchases';
	let purchases: any;
	let listings = $state<any>();
	async function getPurchases() {
		const res = await fetch('http://localhost:3000/api/getPurchases', {
			method: 'POST',
			credentials: 'include',
			body: JSON.stringify({ user_id })
		});
		const data = await res.json();
		if (res.ok) {
			purchases = data.purchases;
		}
	}
	function getImage(path: string | undefined) {
		return path ? `http://localhost:3000/api/getImage?name=${path}` : undefined;
	}
	onMount(async () => {
		await getPurchases();
		let purchases_ids = [];
		for (const purchase of purchases) {
			purchases_ids.push(purchase.listing_id);
		}

		listings = data.allListingsFiltered.filter(
			(listing) => listing.is_sold === 1 && purchases_ids.includes(listing.id)
		);
	});
</script>

<ListingGrid {listings} {getImage} {currentPage} />
