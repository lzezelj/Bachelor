<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { onMount } from 'svelte';
	import { tick } from 'svelte';
	const {
		createListing,
		updateListing,
		getSubcategories,
		subcategories,
		categories,
		conditions,
		upload,
		user_id,
		currentPage,
		listing
	} = $props<{
		createListing?: (
			title: string,
			listing_body: string,
			selectedCategory: string,
			selectedSubcategory: string,
			price: number,
			selectedCondition: string
		) => Promise<void>;
		updateListing?: (
			title: string,
			listing_body: string,
			selectedCategory: string,
			selectedSubcategory: string,
			price: number,
			selectedCondition: string
		) => Promise<void>;
		getSubcategories: (selectedCategory: string) => Promise<void>;
		subcategories: any[];
		categories: any[];
		conditions: any[];
		upload: (files: File[]) => Promise<void>;
		user_id: number;
		currentPage: string;
		listing?: any[];
	}>();

	let files: File[] = [];
	let title = $state('');
	let listing_body = $state();
	let price = $state(0);
	let selectedCategory = $state();
	let selectedSubcategory = $state();
	let selectedCondition = $state();
	let imageUrls = $state<string[]>();
	let popup = $state(false);

	function handleFileChange(e: Event) {
		const input = e.target as HTMLInputElement;
		if (input.files) {
			files = Array.from(input.files).slice(0, 10);
			imageUrls = files.map((file) => URL.createObjectURL(file));
		}
		upload(files);
	}
	onMount(async () => {
		if (currentPage === 'edit' || 'admin') {
			title = listing[0].title;
			listing_body = listing[0].body;
			selectedCategory = listing[0].category;
			await getSubcategories(selectedCategory);
			selectedSubcategory = listing[0].subcategory;
			selectedCondition = listing[0].condition_name;
			price = listing[0].price;
		}
	});
	function handleClickInside(event: MouseEvent) {
		event.stopPropagation();
	}
	function sanitizePrice(event: any) {
		if (price < 0) {
			price = 0;
		}
	}
</script>

<form
	onsubmit={async () => {
		if (currentPage === 'edit' || currentPage === 'admin') {
			updateListing(
				title,
				listing_body,
				selectedCategory,
				selectedSubcategory,
				price,
				selectedCondition
			);
		} else if (currentPage === 'create') {
			createListing(
				title,
				listing_body,
				selectedCategory,
				selectedSubcategory,
				price,
				selectedCondition
			);
		}
		popup = true;
		await tick();
		document.getElementById('popup-overlay')?.focus();
		imageUrls = [];
		invalidateAll();
	}}
	class="mx-auto w-full max-w-md space-y-4"
>
	<label class="label">
		<span class="label-text">Title</span>
		<input bind:value={title} type="text" />
	</label>
	<label class="label">
		<span class="label-text">Description</span>
		<input bind:value={listing_body} type="text" />
	</label>
	<label class="label">
		<span class="label-text">Category</span>
		<select bind:value={selectedCategory} onchange={() => getSubcategories(selectedCategory)}>
			<option disabled selected>Select a Category</option>
			{#each categories as category}
				<option class="text-black" value={category.category}>{category.category}</option>
			{/each}
		</select>
	</label>
	<label class="label">
		<span class="label-text">Subcategory</span>
		<select bind:value={selectedSubcategory}>
			<option disabled selected>Select a Subgategory</option>
			{#each subcategories as subcategory}
				<option class="text-black" value={subcategory.subcategory}>{subcategory.subcategory}</option
				>
			{/each}
		</select>
	</label>
	<label class="label">
		<span class="label-text">Price (in €)</span>
		<input oninput={sanitizePrice} bind:value={price} type="number" />
	</label>
	<label class="label">
		<span class="label-text">Condition</span>
		<select bind:value={selectedCondition}>
			<option disabled selected>Select a Condition</option>
			{#each conditions as condition}
				<option class="text-black" value={condition.condition_name}
					>{condition.condition_name}</option
				>
			{/each}
		</select>
	</label>

	<input
		class="hidden"
		id="fileInput"
		type="file"
		multiple
		accept="image/*"
		onchange={handleFileChange}
	/>
	<label for="fileInput" class="cursor-pointer rounded py-2 text-white">Upload Images</label>
	{#if imageUrls}
		<div style="display: flex; flex-wrap: wrap; gap: 10px; margin-top: 1rem;">
			{#each imageUrls as url}
				<img src={url} alt="Preview" style="max-width: 30%; height: auto;" />
			{/each}
		</div>
	{/if}
	<br />
	<br />
	{#if currentPage === 'edit' || currentPage === 'admin'}
		<input
			disabled={title == '' ||
				selectedCategory == 'Select a Category' ||
				selectedSubcategory == 'Select a Subcategory' ||
				selectedCondition == 'Select a Condition' ||
				price == undefined ||
				price == 0}
			class=" cursor-pointer"
			value="Update Listing"
			type="Submit"
		/>
	{:else if currentPage === 'create'}
		<input
			disabled={title == '' ||
				selectedCategory == 'Select a Category' ||
				selectedSubcategory == 'Select a Subcategory' ||
				selectedCondition == 'Select a Condition' ||
				price == undefined ||
				price == 0}
			class=" cursor-pointer"
			value="Create Listing"
			type="Submit"
		/>
	{/if}
</form>

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
			{#if currentPage === 'edit'}
				<h2 class="mb-2 text-xl text-black">Listing updated successfully</h2>
				<p class="mb-2 text-black">
					Go to your <a href="/myListings" class="text-blue-500">listings</a>
				</p>
			{:else if currentPage === 'create'}
				<h2 class="mb-2 text-xl text-black">Listing created successfully</h2>
				<p class="mb-2 text-black">
					Go to your <a href="/myListings" class="text-blue-500">listings</a>
				</p>
			{:else if currentPage === 'admin'}
				<h2 class="mb-2 text-xl text-black">Listing updated successfully</h2>
				<p class="mb-2 text-black">
					Go to your <a href="/admin/listings" class="text-blue-500">listings</a>
				</p>
			{/if}
		</div>
	</div>
{/if}
