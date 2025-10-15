<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import type { PageProps } from './$types';
	let { data }: PageProps = $props();
	let condition = $state();
	let category = $state();
	let subcategories = $state<any>();
	let selectedCondIds = $state(new Set<number>());
	let selectedCatIds = $state(new Set<number>());
	let selectedSubCatIds = $state(new Set<number>());
	let selectedCategory = $state();
	let subCategory = $state();

	async function getSubcategories() {
		const res = await fetch('http://localhost:3000/api/getSubcategories', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ category: selectedCategory }),
			credentials: 'include'
		});
		const data = await res.json();
		if (res.ok) {
			subcategories = data.subcategories;
			await invalidateAll();
		}
	}

	function toggleSelectionCondition(id: number) {
		if (selectedCondIds.has(id)) {
			selectedCondIds.delete(id);
		} else {
			selectedCondIds.add(id);
		}
		selectedCondIds = new Set(selectedCondIds);
	}
	function toggleSelectionCategory(id: number) {
		if (selectedCatIds.has(id)) {
			selectedCatIds.delete(id);
		} else {
			selectedCatIds.add(id);
		}
		selectedCatIds = new Set(selectedCatIds);
	}
	function toggleSelectionSubcategory(id: number) {
		if (selectedSubCatIds.has(id)) {
			selectedSubCatIds.delete(id);
		} else {
			selectedSubCatIds.add(id);
		}
		selectedSubCatIds = new Set(selectedSubCatIds);
	}

	async function deleteConditions() {
		const res = await fetch('http://localhost:3000/api/deleteConditions', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ selectedCondIds: Array.from(selectedCondIds) }),
			credentials: 'include'
		});
		const data = await res.json();
		if (res.ok) {
			selectedCondIds.clear();
			await invalidateAll();
		}
	}
	async function deleteSubcategories() {
		const res = await fetch('http://localhost:3000/api/deleteSubcategories', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ selectedSubCatIds: Array.from(selectedSubCatIds) }),
			credentials: 'include'
		});
		const data = await res.json();
		if (res.ok) {
			selectedSubCatIds.clear();
			await getSubcategories();
		}
	}
	async function deleteCategories() {
		const res = await fetch('http://localhost:3000/api/deleteCategories', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ selectedCatIds: Array.from(selectedCatIds) }),
			credentials: 'include'
		});
		const data = await res.json();
		if (res.ok) {
			selectedCatIds.clear();
			await invalidateAll();
		}
	}
	async function addCondition() {
		const res = await fetch('http://localhost:3000/api/addCondition', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ condition }),
			credentials: 'include'
		});
		const data = await res.json();
		if (res.ok) {
			await invalidateAll();
		}
	}
	async function addSubcategory() {
		const res = await fetch('http://localhost:3000/api/addSubcategory', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ selectedCategory, subCategory }),
			credentials: 'include'
		});
		const data = await res.json();
		if (res.ok) {
			await getSubcategories();
		}
	}
	async function addCategory() {
		const res = await fetch('http://localhost:3000/api/addCategory', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ category }),
			credentials: 'include'
		});
		const data = await res.json();
		if (res.ok) {
			await invalidateAll();
		}
	}
</script>

<div class="flex justify-center">
	<div>
		<form onsubmit={addCondition} class="mx-auto w-full max-w-md space-y-4 p-2">
			<label class="label">
				<span class="label-text">Condition</span>
				<input bind:value={condition} type="text" name="Condition" />
			</label>

			<input disabled={!condition} value="Add condition" type="Submit" />
		</form>

		{#each data.conditions as condition}
			<div class="flex items-center space-x-2 p-1">
				<input
					type="checkbox"
					checked={selectedCondIds.has(condition.id)}
					onchange={() => toggleSelectionCondition(condition.id)}
				/>
				<span>{condition.condition_name}</span>
				<br />
			</div>
		{/each}
		<button class="p-1" onclick={deleteConditions} disabled={selectedCondIds.size === 0}>
			Delete Selected Conditions</button
		>

		<form onsubmit={addCategory} class="mx-auto w-full max-w-md space-y-4 p-2">
			<label class="label">
				<span class="label-text">Category</span>
				<input bind:value={category} type="text" name="Category" />
			</label>

			<input disabled={!category} value="Add category" type="Submit" />
		</form>
		{#each data.categories as category}
			<div class="flex items-center space-x-2 p-1">
				<input
					type="checkbox"
					checked={selectedCatIds.has(category.id)}
					onchange={() => toggleSelectionCategory(category.id)}
				/>
				<span>{category.category}</span>
				<br />
			</div>
		{/each}
		<button class="p-1" onclick={deleteCategories} disabled={selectedCatIds.size === 0}>
			Delete Selected Categories</button
		>

		<br />

		<select bind:value={selectedCategory} onchange={getSubcategories}>
			<option disabled selected>Select a Category</option>
			{#each data.categories as category}
				<option class="text-black" value={category.category}>{category.category}</option>
			{/each}
		</select>
		<form onsubmit={addSubcategory} class="mx-auto w-full max-w-md space-y-4 p-2">
			<label class="label">
				<span class="label-text">Subcategory</span>
				<input bind:value={subCategory} type="text" name="Subcategory" />
			</label>

			<input
				disabled={selectedCategory == 'Select a Category' || !subCategory}
				value="Add subcategory"
				type="Submit"
			/>
		</form>

		{#if selectedCategory !== 'Select a Category'}
			{#each subcategories as subcategory}
				<div class="flex items-center space-x-2 p-1">
					<input
						type="checkbox"
						checked={selectedSubCatIds.has(subcategory.id)}
						onchange={() => toggleSelectionSubcategory(subcategory.id)}
					/>
					<span>{subcategory.subcategory}</span>
				</div>
			{/each}
			<button class="p-1" onclick={deleteSubcategories} disabled={selectedSubCatIds.size === 0}>
				Delete Selected Subcategories</button
			>
		{/if}
	</div>
</div>
