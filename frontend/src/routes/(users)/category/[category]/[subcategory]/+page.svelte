<script lang="ts">
	import type { PageProps } from './$types';
	import ListingGrid from '$lib/ListingGrid.svelte';
	import { category, colours } from '$lib/state.svelte';
	let { data }: PageProps = $props();
	let listings = $state<any>();
	let currentPage = '';
	function getImage(path: string | undefined) {
		return path ? `http://localhost:3000/api/getImage?name=${path}` : undefined;
	}
	$effect(() => {
		if (data?.listing) {
			const uniqueListings = Array.from(
				new Map(data.listing.map((item: { id: any }) => [item.id, item])).values()
			);
			let filtered: any[];

			if (category.condition?.length > 0) {
				filtered = uniqueListings.filter((listing: any) =>
					category.condition.includes(listing.condition_name)
				);
			} else {
				filtered = uniqueListings;
			}

			listings = filtered?.map((item: any) => {
				const date = new Date(item.created_at);
				const day = String(date.getUTCDate()).padStart(2, '0');
				const month = String(date.getUTCMonth() + 1).padStart(2, '0');
				const year = date.getUTCFullYear();
				return {
					...item,
					created_at: `${day}.${month}.${year}`
				};
			});
		}
	});
</script>

<ListingGrid {listings} {getImage} {currentPage} />
