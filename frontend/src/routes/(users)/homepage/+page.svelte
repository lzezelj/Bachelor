<script lang="ts">
	import { onMount } from 'svelte';
	import ListingGrid from '$lib/ListingGrid.svelte';
	import { page } from '$app/state';

	let currentPage = 'homepage';
	let listings = $state(page.data.allListingsFiltered);

	function getImage(path: string | undefined) {
		return path ? `http://localhost:3000/api/getImage?name=${path}` : undefined;
	}
</script>

<ListingGrid {listings} {getImage} {currentPage} />
