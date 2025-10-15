<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { onMount, tick } from 'svelte';
	import { colours } from './state.svelte';
	import { page } from '$app/state';
	import { assets } from '$app/paths';
	let popup = $state(false);
	let selectedListing = $state();
	let showMyListings = $state(true);
	const { listings, getImage, currentPage, deleteListing } = $props<{
		listings: any[];
		getImage: (path: string | undefined) => string | undefined;
		currentPage: string;
		deleteListing?(listingId: number): any;
	}>();
	if (currentPage == 'myListings') {
		showMyListings = false;
	}
	let shownListings = $state(listings);
	let allListings = $derived(listings);
	let myListingsRemoved = $derived(
		currentPage !== 'myListings' && page.data.user
			? listings.filter((listing: any) => listing.user_id !== page.data.user.data.id)
			: listings
	);

	function handleClickInside(event: MouseEvent) {
		event.stopPropagation();
	}

	$effect(() => {
		if (showMyListings) {
			shownListings = allListings;
		} else {
			shownListings = myListingsRemoved;
		}
	});
	onMount(async () => {
		if (!listings) {
			await invalidateAll();
		}
	});
</script>

{#if currentPage !== 'purchases' && currentPage !== 'myListings' && page.data.user}
	<div class="rounded p-4" style="background-color: {colours.sidebar};">
		<label>
			Show my Listings
			<input type="checkbox" bind:checked={showMyListings} />
		</label>
	</div>
{/if}
<div class="flex grid w-full grid-cols-4 gap-12">
	{#each shownListings as listing}
		{#if !listing.is_sold || currentPage == 'purchases'}
			<div
				style="background-color: {colours.sidebar};"
				class="card preset-filled-surface-100-900 border-surface-200-800 card-hover divide-surface-200-800 block max-w-md divide-y overflow-hidden border-[1px]"
			>
				<a href={`/listing/${listing.id}`}>
					<header>
						<header class="h-96 overflow-hidden">
							{#if listing.image_path}
								<img
									src={getImage(listing.image_path)}
									class="h-full w-full object-cover"
									alt="banner"
								/>
							{/if}
						</header>
					</header>
					<article class="space-y-4 p-4">
						<div>
							<h2 class="h6"><b>{listing.category}</b> - {listing.subcategory}</h2>
							<h3 class="h3">{listing.title}</h3>
						</div>
						<p class="opacity-60">{listing.body}</p>
					</article>
				</a>
				<footer class="flex items-center justify-between gap-4 p-4">
					{#if currentPage === 'myListings'}
						<a href="/updateListing/{listing.id}">Edit</a>
						<button
							onclick={async () => {
								popup = true;
								await tick();
								document.getElementById('popup-overlay')?.focus();
								selectedListing = listing.id;
							}}
							class="text-red-500">Delete</button
						>
					{:else}
						{listing.price} €
						<small class="opacity-60">Created on {listing.created_at}</small>
					{/if}
				</footer>
			</div>
		{/if}
	{/each}
</div>
{#if popup}
	<div
		id="popup-overlay"
		onkeydown={(e) => {
			if (e.key === 'Escape') popup = false;
		}}
		role="button"
		tabindex="0"
		class="fixed inset-0 flex items-center justify-center bg-black/50"
		onclick={() => (popup = false)}
	>
		<div
			id="popup-overlay"
			onkeydown={(e) => {
				if (e.key === 'Escape') popup = false;
			}}
			role="button"
			tabindex="0"
			class="rounded bg-white p-6 shadow-lg"
			onclick={handleClickInside}
		>
			<h2 class="mb-2 text-xl text-black">Are you sure you want to delete this Listings?</h2>
			<div class="ml-35 mr-35 mt-6 flex justify-between">
				<button
					onclick={() => {
						deleteListing(selectedListing);
						popup = false;
					}}
					class="mb-2 rounded-md bg-gray-200 p-1 text-black">Yes</button
				>
				<button onclick={() => (popup = false)} class="mb-2 rounded-md bg-gray-200 p-1 text-black"
					>No</button
				>
			</div>
		</div>
	</div>
{/if}
