<script lang="ts">
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import ListingGrid from '$lib/ListingGrid.svelte';
	import { invalidateAll } from '$app/navigation';
	let user_id = page.data.user.data.id;
	let currentPage = 'myListings';
	let listings = $state<any>();
	let user = $state<any>();
	async function getAllListingsFromUser() {
		const res = await fetch('http://localhost:3000/api/getAllListingsFromUser', {
			method: 'POST',
			credentials: 'include',
			body: user_id
		});
		if (res.ok) {
			const data = await res.json();
			listings = data.listing;
		} else {
			console.error('Failed to fetch listings');
		}
	}
	function formatDate() {
		for (let i = 0; i < listings.length; i++) {
			const date = new Date(listings[i].created_at);
			const day = String(date.getUTCDate()).padStart(2, '0');
			const month = String(date.getUTCMonth() + 1).padStart(2, '0');
			const year = date.getUTCFullYear();
			const formattedDate = `${day}.${month}.${year}`;
			listings[i].created_at = formattedDate;
		}
	}

	function getImage(path: any) {
		return path ? `http://localhost:3000/api/getImage?name=${path}` : undefined;
	}
	async function deleteListing(listingId: number) {
		const res = await fetch('http://localhost:3000/api/deleteListings', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ selectedListing: listingId }),
			credentials: 'include'
		});
		const data = await res.json();
		if (res.ok) {
			await refreshListings();
		}
	}
	async function refreshListings() {
		if (user_id) {
			await getAllListingsFromUser();
			listings = Array.from(new Map(listings.map((item: { id: any }) => [item.id, item])).values());
			formatDate();
		}
	}
	onMount(async () => {
		refreshListings();
	});
</script>

<ListingGrid {listings} {getImage} {currentPage} {deleteListing} />
