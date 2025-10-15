<script lang="ts">
	import type { PageProps } from './$types';
	import ImageGallery from '$lib/ImageGallery.svelte';
	import { colours } from '$lib/state.svelte';
	import { onMount } from 'svelte';
	let { data }: PageProps = $props();
	let currentImage = $state(data.listing[0].image_path);
	let username = $state<any[]>();
	function selectImage(image: any) {
		currentImage = image;
	}
	async function getUserInfo(user_id: number) {
		const res = await fetch('http://localhost:3000/api/getUserInfo', {
			method: 'POST',
			credentials: 'include',
			body: JSON.stringify(user_id)
		});
		if (res.ok) {
			const data = await res.json();
			username = data.user;
		} else {
			console.error('Failed to fetch listings');
		}
	}
	onMount(async () => {
		await getUserInfo(data.listing[0].user_id);
		//console.log(username[0].username);
	});
</script>

<br />
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
		{#if username}
			{username[0].username}
		{/if}
	</div>
</div>
