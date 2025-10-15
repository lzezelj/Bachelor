<script lang="ts">
	import '../app.css';
	import { goto, invalidateAll } from '$app/navigation';
	import { onMount } from 'svelte';
	import { colours } from '$lib/state.svelte';
	let { data, children } = $props();
	async function logout() {
		console.log('as');
		const res = await fetch('http://localhost:3000/api/logout', {
			method: 'GET',
			credentials: 'include'
		});
		await goto('/admin/login', { replaceState: true, invalidateAll: true });
	}
	onMount(() => {
		if (!data.user) {
			goto('/admin/login');
		}
	});
</script>

<div class="grid min-h-screen grid-rows-[auto_1fr_auto]" style="background-color: {colours.main};">
	<header style="background-color: {colours.header};">
		{#if data.user}
			<div class=" flex justify-between p-4">
				<a href="/admin/homepage">Home</a>
				<button onclick={logout}>Logout</button>
			</div>
		{/if}
	</header>

	<div class="  grid grid-cols-2 bg-white xl:grid-cols-[200px_minmax(0px,_1fr)_200px]">
		<aside class="sticky top-0 col-span-1 hidden h-screen p-4 xl:block"></aside>
		<main class="space-y-4 p-8" style="background-color: {colours.sidebar};">
			{@render children()}
		</main>
	</div>
	<footer class="p-4"></footer>
</div>
