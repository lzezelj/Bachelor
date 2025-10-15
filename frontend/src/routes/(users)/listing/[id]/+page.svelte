<script lang="ts">
	import type { PageProps } from './$types';
	import ImageGallery from '$lib/ImageGallery.svelte';
	import { goto, invalidate, invalidateAll } from '$app/navigation';
	import { onMount } from 'svelte';
	import { colours } from '$lib/state.svelte';
	import { page } from '$app/state';
	import { tick } from 'svelte';
	let { data }: PageProps = $props();
	let currentImage = $state(data.listing[0].image_path);
	let deleteImage = $state<string[]>();
	deleteImage = [];
	let listing_id = data.listing[0].id;
	let user_id = $state();
	if (data.user) {
		user_id = data.user.data.id;
	}
	let inCart = $state();
	let popup = $state(false);
	let username = $state();
	function selectImage(image: any) {
		currentImage = image;
	}
	function handleClickInside(event: MouseEvent) {
		event.stopPropagation();
	}
	console.log(data.listing);
	async function getUserInfo(user_id: number) {
		const res = await fetch('http://localhost:3000/api/getUserInfo', {
			method: 'POST',
			credentials: 'include',
			body: JSON.stringify(user_id)
		});
		if (res.ok) {
			const data = await res.json();
			username = data.user[0].username;
		} else {
			console.error('Failed to fetch listings');
		}
	}
	async function addToCart() {
		const res = await fetch('http://localhost:3000/api/addToShoppingCart', {
			method: 'POST',
			credentials: 'include',
			body: JSON.stringify({
				listing_id,
				user_id
			})
		});
		const cart = await res.json();
		if (res.ok) {
			popup = true;
			await tick();
			document.getElementById('popup-overlay')?.focus();
			await invalidateAll();
		}
	}
	$effect(() => {
		if (page.data.shoppingCart) {
			if (page.data.shoppingCart.some((item: any) => item.listing_id === data.listing[0].id)) {
				inCart = false;
			} else {
				inCart = true;
			}
		}
	});
	onMount(async () => {
		await getUserInfo(data.listing[0].user_id);
	});
</script>

<div class="flex grid-cols-2 justify-center">
	<div class="mr-4 rounded-md p-4" style="background-color: {colours.sidebar};">
		<ImageGallery listing={data.listing} {currentImage} {selectImage} />
		<div class=" border-b">
			<span class=" mb-4 mt-4 flex text-2xl font-bold">Description</span>
		</div>
		<span class=" mt-4 flex">{data.listing[0].body}</span>
	</div>
	<div class="rounded-md p-4" style="background-color: {colours.sidebar};">
		<span class="flex justify-center text-2xl font-bold"> {data.listing[0].title}</span>
		<br />
		<span class="font-bold">Category:</span><br />
		<span>{data.listing[0].category} - {data.listing[0].subcategory}</span>
		<br />
		<span class="font-bold">Price:</span><br />
		<span>{data.listing[0].price}€</span>
		<br />
		<span class="font-bold">Condition:</span><br />
		<span>{data.listing[0].condition_name}</span>
		<br />
		<span class="font-bold">Seller information:</span><br />
		<span>{username}</span>

		{#if data.listing[0].user_id !== user_id && data.listing[0].is_sold !== 1 && user_id !== undefined && inCart}
			<span class="mt-32 flex justify-center font-bold">
				<button
					class="inline-block rounded bg-blue-600 px-6 py-2 font-bold"
					onclick={() => addToCart()}>Add to cart</button
				>
			</span>
		{/if}
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
			<h2 class="mb-2 text-xl text-black">Item added to cart</h2>
			<p class="mb-2 text-black">
				Go back to <a href="/homepage" class="text-blue-500">Homepage</a>
			</p>
			<p class="mb-2 text-black">
				Go to <a href="/checkout" class="text-blue-500">Checkout</a>
			</p>
		</div>
	</div>
{/if}
