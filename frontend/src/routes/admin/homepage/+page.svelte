<script lang="ts">
	let { data } = $props();
</script>

{#if !data.user}
	<a href="/admin/login">Login</a>
{/if}
{#if data.user}
	<div class="flex justify-between">
		<a href="/admin/listings">Listings</a>
		<a href="/admin/database">Database</a>
		<a href="/admin/accounts">Acounts</a>
	</div>
{/if}
