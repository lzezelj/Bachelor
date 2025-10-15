<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import { page } from '$app/state';
	import CreateUpdateListing from '$lib/CreateUpdateListing.svelte';
	import { colours } from '$lib/state.svelte';
	import { tick } from 'svelte';
	import type { PageProps } from './$types';
	let { data }: PageProps = $props();
	let categories = data.categories;
	let conditions = data.conditions;
	let filePath = $state<string[]>();
	let subcategories = $state<any>();
	let popup = $state(false);
	let currentPage = 'create';
	async function getSubcategories(category: string) {
		const res = await fetch('http://localhost:3000/api/getSubcategories', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ category }),
			credentials: 'include'
		});
		const data = await res.json();
		if (res.ok) {
			subcategories = data.subcategories;
			await invalidateAll();
		}
	}
	async function upload(files: File[]) {
		if (!files) {
			alert('Please select a file');
			return;
		}

		filePath = [];
		for (const file of files) {
			const formData = new FormData();
			formData.append('file', file);
			const res = await fetch('http://localhost:3000/api/upload', {
				method: 'POST',
				body: formData
			});
			const data = await res.json();
			filePath?.push(data.body);
		}
	}

	let user_id = page.data.user.data.id;

	async function createListing(
		title: string,
		listing_body: string,
		selectedCategory: string,
		selectedSubcategory: string,
		price: number,
		selectedCondition: string
	) {
		let error = '';
		const res = await fetch('http://localhost:3000/api/createListing', {
			method: 'POST',
			headers: { 'Content-Type': 'aplication/json' },
			body: JSON.stringify({
				title,
				listing_body,
				user_id,
				selectedCategory,
				selectedSubcategory,
				filePath,
				price,
				selectedCondition
			}),
			credentials: 'include'
		});
		const result = await res.json();
		if (res.ok) {
			popup = true;
			await tick();
			document.getElementById('popup-overlay')?.focus();
		} else {
			error = result.error || 'Something went wrong';
		}
	}
	function handleClickInside(event: MouseEvent) {
		event.stopPropagation();
	}
</script>

<div class="flex justify-center p-6" style="background-color: {colours.sidebar};">
	<CreateUpdateListing
		{createListing}
		{getSubcategories}
		{subcategories}
		{categories}
		{conditions}
		{upload}
		{user_id}
		{currentPage}
	/>
</div>
