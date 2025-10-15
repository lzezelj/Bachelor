<script lang="ts">
	import '../app.css';
	import { goto, invalidateAll } from '$app/navigation';
	import { page } from '$app/state';
	import { category, colours } from '$lib/state.svelte';
	import homeButton from '$lib/homeButton.png';
	let { data, children } = $props();
	let shoppingCart = $derived(data.shoppingCart);
	let totalPrice = $derived(data.totalPrice);
	let selectedCondIds = $state(new Set<number>());

	function toggleSelectionCondition(id: number, condition: string) {
		if (selectedCondIds.has(id)) {
			category.condition = category.condition?.filter((cond: any) => cond !== condition);
			selectedCondIds.delete(id);
		} else {
			category.condition.push(condition);
			selectedCondIds.add(id);
		}
		selectedCondIds = new Set(selectedCondIds);
	}

	function getCount(category: string, subcategory?: string) {
		if (!data.counts[category]) return 0;

		if (!subcategory) return data.counts[category].total;

		return data.counts[category].subcategories[subcategory] || 0;
	}

	async function logout() {
		dropdownMenu();
		const res = await fetch('http://localhost:3000/api/logout', {
			method: 'GET',
			credentials: 'include'
		});
		await goto('/homepage', { replaceState: true, invalidateAll: true });
	}

	let menu = $state(false);
	const dropdownMenu = () => {
		cart = false;
		menu = !menu;
	};

	let cart = $state(false);
	const dropdownShoppingCart = () => {
		menu = false;
		cart = !cart;
	};

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
</script>

<div class="grid min-h-screen grid-rows-[auto_1fr_auto]" style="background-color: {colours.main};">
	<header style="background-color: {colours.header};">
		<nav class="flex items-center justify-between p-4">
			<div class="flex gap-4">
				<a
					href="/homepage"
					onclick={async () => await invalidateAll()}
					class="flex items-center hover:underline"
					><img class="mr-4 h-12 w-10" src={homeButton} alt="Home" /> Home</a
				>
			</div>
			{#if !data.user}
				<div>
					<a href="/login" class="hover:underline">Login/Register</a>
				</div>
			{:else}
				<div class="relative">
					<a href="/createListing">Create a Listing</a>
					<button class="btn m-1" onclick={dropdownMenu}>
						{#if menu}
							Close
						{:else}
							My account
						{/if}
					</button>
					<button class="btn m-1" onclick={dropdownShoppingCart}>
						{#if cart}
							Close
						{:else}
							Shopping Cart
						{/if}
					</button>
					<div
						class="w-84 absolute right-1 mt-2 max-h-[18rem] overflow-y-auto rounded-lg bg-white p-4 shadow-lg"
						style:visibility={cart ? 'visible' : 'hidden'}
					>
						{#if shoppingCart && shoppingCart.length > 0}
							{#each shoppingCart as x}
								<div class="mb-3 flex items-center justify-between">
									<div class="flex max-w-[calc(100%-2.5rem)] items-center gap-3 overflow-hidden">
										<img
											src={`http://localhost:3000/api/getImage?name=${x.image_path}`}
											alt={x.title}
											class="h-12 w-12 flex-shrink-0 rounded-md border object-cover"
										/>
										<div class="flex flex-col overflow-hidden">
											<span class="truncate font-medium text-gray-800" title={x.title}>
												{x.title}
											</span>
											<span class="text-sm text-gray-600">€{x.price}</span>
										</div>
									</div>
									<button
										class="flex h-6 w-6 items-center justify-center rounded-full bg-red-500 font-bold hover:bg-red-600"
										onclick={() => removeFromShoppingCart(x.id, x.listing_id)}
										aria-label="Remove item"
									>
										×
									</button>
								</div>
							{/each}

							<div class="mt-2 border-t border-gray-200 pt-3">
								<p class="text-lg font-semibold text-gray-800">
									Total: €{totalPrice}
								</p>
							</div>

							<div class="mt-4 flex justify-center">
								<a
									href="/checkout"
									class="inline-block rounded bg-blue-600 px-6 py-2 text-center text-sm font-semibold shadow hover:bg-blue-700"
									onclick={() => (cart = false)}
								>
									Checkout
								</a>
							</div>
						{:else}
							<p class="text-center text-sm text-gray-500">Your cart is empty</p>
						{/if}
					</div>

					<ul
						class="absolute right-1 mt-2 max-h-[18rem] w-64 overflow-y-auto rounded-lg bg-white p-4 shadow-lg"
						style:visibility={menu ? 'visible' : 'hidden'}
					>
						<li>
							<a href="/settings" class="font-medium text-gray-800" onclick={dropdownMenu}
								>My information</a
							>
						</li>

						<li>
							<a href="/myListings" class="font-medium text-gray-800" onclick={dropdownMenu}
								>My listings</a
							>
						</li>
						<li>
							<div>
								<button onclick={logout} class="font-medium text-gray-800" type="button"
									>Logout</button
								>
							</div>
						</li>
					</ul>
				</div>
			{/if}
		</nav>
	</header>
	{#if page.url.pathname === '/homepage' || page.url.pathname.startsWith('/category/')}
		<div class="grid grid-cols-2 xl:grid-cols-[250px_minmax(0px,_1fr)_250px]">
			<aside class="col-span-1 hidden p-4 xl:block" style="background-color: {colours.sidebar};">
				<a href="/homepage" class="font-bold">All Categories</a><br />
				<div class="ml-4">
					{#each data.categories as category}
						<a href={`/category/${category.category}/all`} class="font-bold"
							>{category.category}{#if data.counts}({getCount(category.category)}){/if}
						</a>
						<br />
						{#each data.subcategories as subcategory}
							<div class="ml-4">
								{#each subcategory as subcat}
									{#if subcat.category === category.category}
										<a href={`/category/${category.category}/${subcat.subcategory}`}
											>{subcat.subcategory} ({getCount(category.category, subcat.subcategory)})</a
										>
										<br />
									{/if}
								{/each}
							</div>
						{/each}
					{/each}
				</div>
				{#if page.url.pathname.startsWith('/category/')}
					<div class="border-t">
						{#each data.conditions as condition}
							<input
								type="checkbox"
								checked={selectedCondIds.has(condition.id)}
								onchange={() => toggleSelectionCondition(condition.id, condition.condition_name)}
							/>
							<span>{condition.condition_name}</span>
							<br />
						{/each}
					</div>
				{/if}
			</aside>

			<main class="space-y-4 p-8">
				{@render children()}
			</main>
		</div>

		<footer class="p-4"></footer>
	{:else if page.url.pathname.startsWith('/settings')}
		<div class="grid grid-cols-2 xl:grid-cols-[250px_minmax(0px,_1fr)_250px]">
			<aside class="col-span-1 hidden p-4 xl:block" style="background-color: {colours.sidebar};">
				<a href="/settings" class="font-bold">My Information</a><br />
				<a href="/settings/purchases" class="mt-4 flex font-bold">My Purchases</a><br />
			</aside>

			<main class="space-y-4 p-8" style="background-color: {colours.main};">
				{@render children()}
			</main>
		</div>
		<footer class="p-4"></footer>
	{:else}
		<div class="  grid grid-cols-2 bg-white xl:grid-cols-[250px_minmax(0px,_1fr)_250px]">
			<aside class="sticky top-0 col-span-1 hidden h-screen p-4 xl:block"></aside>
			<main class="space-y-4 p-8" style="background-color: {colours.main};">
				{@render children()}
			</main>
		</div>
		<footer class="p-4"></footer>
	{/if}
</div>
