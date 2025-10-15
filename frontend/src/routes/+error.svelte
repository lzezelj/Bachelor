<script lang="ts">
	import { page } from '$app/state';
</script>

<div class="flex">
	Error {page.status}
	{#if page.status === 404}
		<p>The page you are looking for doesn't exist.</p>
	{:else if page.status === 500}
		{#if page.url.pathname.startsWith('/admin')}
			<p>You are not authorized to access this page.</p>
			<p>Please go and <a data-sveltekit-preload-data="off" href="/admin/login">login</a></p>
		{:else}
			<p>You are not authorized to access this page.</p>
			<p>Please go and <a data-sveltekit-preload-data="off" href="/login">login</a></p>
		{/if}
	{/if}
</div>
