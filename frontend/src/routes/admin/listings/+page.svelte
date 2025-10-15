<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { onMount } from 'svelte';
	let listings = $state<any>();
	let user = $state<any>();
	let selectedListing = $state(new Set<number>());
	let listingUsernames = $state<Record<number, string>>({});
	function toggleSelectionCondition(id: number) {
		if (selectedListing.has(id)) {
			selectedListing.delete(id);
		} else {
			selectedListing.add(id);
		}
		selectedListing = new Set(selectedListing);
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
	async function getUserInfo(user_id: number) {
		const res = await fetch('http://localhost:3000/api/getUserInfo', {
			method: 'POST',
			credentials: 'include',
			body: JSON.stringify(user_id)
		});
		if (res.ok) {
			const data = await res.json();
			user = data.user;
		} else {
			console.error('Failed to fetch listings');
		}
	}
	async function deleteListings() {
		const res = await fetch('http://localhost:3000/api/deleteListings', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ selectedCatIds: Array.from(selectedListing) }),
			credentials: 'include'
		});
		const data = await res.json();
		if (res.ok) {
			selectedListing.clear();
			await getAllListings();
			listings = Array.from(new Map(listings.map((item: { id: any }) => [item.id, item])).values());
			await invalidateAll();
		}
	}
	async function getAllListings() {
		const res = await fetch('http://localhost:3000/api/getAllListings', {
			method: 'GET',
			credentials: 'include'
		});
		if (res.ok) {
			const data = await res.json();
			listings = data.listing;
		} else {
			console.error('Failed to fetch listings');
		}
	}
	function getImage(path: string | undefined) {
		return path ? `http://localhost:3000/api/getImage?name=${path}` : undefined;
	}

	onMount(async () => {
		await getAllListings();
		listings = Array.from(new Map(listings.map((item: { id: any }) => [item.id, item])).values());
		formatDate();
		for (let i = 0; i < listings.length; i++) {
			await getUserInfo(listings[i].user_id);
			listingUsernames[listings[i].id] = user[0].username;
		}
	});
</script>

<button onclick={deleteListings} disabled={selectedListing.size === 0}> Delete Listings</button>

<div class="grid w-full grid-cols-5 gap-6">
	{#each listings as listing}
		<div
			class="card preset-filled-surface-100-900 border-surface-200-800 card-hover divide-surface-200-800 block max-w-md divide-y overflow-hidden border-[1px]"
		>
			<header class="flex items-center justify-between gap-4 p-4">
				<label class="flex cursor-pointer items-center gap-2">
					<input
						type="checkbox"
						checked={selectedListing.has(listing.id)}
						onchange={() => toggleSelectionCondition(listing.id)}
					/>
					Delete
				</label>
				<a href="/admin/changeListing/{listing.id} ">Update</a>
			</header>
			<a href="/admin/listing/{listing.id}">
				<header class="h-96 overflow-hidden">
					{#if listing.image_path}
						<img
							src={getImage(listing.image_path)}
							class="h-full w-full object-cover"
							alt="banner"
						/>
					{/if}
				</header>
				<article class="space-y-4 p-4">
					<div>
						<h2 class="h6"><b>{listing.category}</b> - {listing.subcategory}</h2>
						<h3 class="h3">{listing.title}</h3>
					</div>
					<p class="opacity-60">
						{listing.body}
					</p>
				</article>
				<footer class="flex items-center justify-between gap-4 p-4">
					{listingUsernames[listing.id]}

					<small class="opacity-60">Created on {listing.created_at}</small>
				</footer>
			</a>
		</div>
	{/each}
</div>
