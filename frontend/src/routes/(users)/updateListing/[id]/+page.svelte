<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import type { PageProps } from './$types';
	import CreateUpdateListing from '$lib/CreateUpdateListing.svelte';
	import { colours } from '$lib/state.svelte';
	import { onMount, tick } from 'svelte';
	let { data }: PageProps = $props();
	let deleteImage = $state<string[]>();
	let files: File[] = [];
	let filePath = $state<string[]>();
	let imageUrls = $state<string[]>();
	let subcategories = $state<any>();
	let popup = $state(false);
	let categories = data.categories;
	let conditions = data.conditions;
	let listing = data.listing;
	let currentPage = 'edit';
	let user_id = $state(data.user.data.id);
	let user_listing_id = $state(data.listing[0].user_id);
	let listing_id = data.listing[0].id;

	deleteImage = [];
	function handleClickInside(event: MouseEvent) {
		event.stopPropagation();
	}
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
	async function updateListing(
		title: string,
		listing_body: string,
		selectedCategory: string,
		selectedSubcategory: string,
		price: number,
		selectedCondition: string
	) {
		const res = await fetch('http://localhost:3000/api/updateListing', {
			method: 'POST',
			headers: { 'Content-Type': 'aplication/json' },
			body: JSON.stringify({
				listing_id,
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
		filePath = [];
		invalidateAll();
	}
	async function upload(files: File[]) {
		console.log(files);
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
	function selectImages(image: any) {
		let index = deleteImage?.indexOf(image);
		if (index === -1) {
			deleteImage?.push(image);
		} else {
			deleteImage = deleteImage?.filter((img) => img !== image);
		}
	}

	async function deleteImages() {
		const res = await fetch('http://localhost:3000/api/deleteImages', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ imageIds: deleteImage }),
			credentials: 'include'
		});
		const data = await res.json();
		if (res.ok) {
			deleteImage = [];
			await invalidateAll();
		}
	}
	onMount(async () => {
		if (user_id != user_listing_id) {
			user_id = undefined;
		}
	});
</script>

{#if user_id == undefined}
	<p class="text-black">You are not authorized to access this page.</p>
	<p class="text-black">Go back to your <a href="/myListings">listings</a></p>
{:else if user_id != undefined}
	<div style="background-color: {colours.sidebar};" class=" p-4">
		<main class="flex flex-col items-center space-y-4 p-4">
			<div class="flex grid grid-cols-5 gap-4">
				{#each data.listing as listing}
					<button
						type="button"
						onclick={() => selectImages(listing.image_path)}
						class="rounded border-4 focus:outline
				       {deleteImage?.includes(listing.image_path) ? 'border-blue-500' : 'border-transparent'}"
					>
						<img
							src={`http://localhost:3000/api/getImage?name=${listing.image_path}`}
							alt="Preview"
							class="h-[128px]"
						/>
					</button>
				{/each}
			</div>

			<button
				type="button"
				onclick={async () => {
					popup = true;
					await tick();
					document.getElementById('popup-overlay')?.focus();
				}}
				class="mt-4 rounded bg-red-500 px-6 py-2 text-white hover:bg-red-600"
				disabled={deleteImage?.at(0) == undefined}
			>
				Delete selected Images
			</button>
		</main>

		<br />

		<CreateUpdateListing
			{updateListing}
			{getSubcategories}
			{subcategories}
			{categories}
			{conditions}
			{upload}
			{user_id}
			{currentPage}
			{listing}
		/>
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
				onkeydown={(e) => {
					if (e.key == 'Escape') popup = false;
				}}
				role="button"
				tabindex="0"
				class="rounded bg-white p-6 shadow-lg"
				onclick={handleClickInside}
			>
				<h2 class="mb-2 text-xl text-black">Are you sure you want to delete selected images?</h2>
				<div class="ml-35 mr-35 mt-6 flex justify-between">
					<button
						onclick={() => {
							deleteImages();
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
{/if}
