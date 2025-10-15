<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import { colours } from '$lib/state.svelte';
	import { error } from '@sveltejs/kit';
	import { onMount, tick } from 'svelte';

	let { data } = $props();
	let unauthorized = data.user.user_id; //Throws error 500 if not logged in
	let shoppingCart = $state(data.shoppingCart);
	let totalPrice = $state(data.totalPrice);
	let listing_id = $state(<any>[]);
	let buyer_id = $state(<any>[]);
	let seller_id = $state(<any>[]);
	let popup = $state(false);
	function handleClickInside(event: MouseEvent) {
		event.stopPropagation();
	}
	async function removeFromShoppingCart(id: number, listing_id: number) {
		const res = await fetch('http://localhost:3000/api/removeFromShoppingCart', {
			method: 'POST',
			credentials: 'include',
			body: JSON.stringify({ id, listing_id })
		});
		if (res.ok) {
			await invalidateAll();
			shoppingCart = data.shoppingCart;

			totalPrice = data.totalPrice;
		}
	}

	async function purchase() {
		const res = await fetch('http://localhost:3000/api/purchase', {
			method: 'POST',
			credentials: 'include',
			body: JSON.stringify({ seller_id, buyer_id, listing_id })
		});
		if (res.ok) {
			await goto('/settings/purchases', { replaceState: true, invalidateAll: true });
		}
	}
	onMount(async () => {
		for (const listing of shoppingCart) {
			listing_id.push(listing.listing_id);
			buyer_id.push(listing.user_id);
			let res = await fetch(`http://localhost:3000/api/getListing?id=${listing.listing_id}`);
			const seller = await res.json();
			seller_id.push(seller[0].user_id);
		}
	});
</script>

<div class="mt-4 flex justify-center">
	<div
		class=" max-h-[80vh] w-4/5 overflow-y-auto rounded-lg p-4"
		style="background-color: {colours.sidebar};"
	>
		{#each shoppingCart as x}
			<div class="mb-4 flex items-center justify-between">
				<div class="flex items-center gap-3 overflow-hidden">
					<img
						src={`http://localhost:3000/api/getImage?name=${x.image_path}`}
						alt={x.title}
						class="h-20 w-20 flex-shrink-0 rounded-md border object-cover"
					/>
					<div class="flex flex-col overflow-hidden">
						<span class="truncate font-medium" title={x.title}>
							{x.title}
						</span>
						<span class="text-sm">€{x.price}</span>
					</div>
				</div>

				<button
					class="flex h-8 w-8 items-center justify-center rounded-full bg-red-500 font-bold text-white hover:bg-red-600"
					onclick={() => removeFromShoppingCart(x.id, x.listing_id)}
					aria-label="Remove item"
				>
					×
				</button>
			</div>
		{/each}
		<div class="border-t"></div>
		<div class="mt-4 text-right">Total price: {totalPrice} €</div>
		<div class="mt-4 text-right">
			<button
				class=" rounded-xl p-2 text-black"
				style="background-color: {colours.main};"
				disabled={!(seller_id.length && buyer_id.length && listing_id.length)}
				onclick={async () => {
					popup = true;
					await tick();
					document.getElementById('popup-overlay')?.focus();
				}}
				type="button">Purchase</button
			>
		</div>
	</div>
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
			<h2 class="mb-2 text-xl text-black">Are you sure you want to purchase selected items?</h2>
			<div class="ml-35 mr-35 mt-6 flex justify-between">
				<button
					onclick={() => {
						purchase();
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
