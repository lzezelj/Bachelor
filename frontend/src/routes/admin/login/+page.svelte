<script lang="ts">
	import { goto } from '$app/navigation';

	let username = '';
	let password = '';
	let error = '';
	let success = '';

	async function login() {
		error = '';
		success = '';
		const res = await fetch('http://localhost:3000/api/adminLogin', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ username, password }),
			credentials: 'include'
		});
		const data = await res.json();
		if (res.ok) {
			success = 'Registration successful';
			await goto('/admin/homepage', { replaceState: true, invalidateAll: true });
		} else {
			error = data.error || 'Something went wrong';
		}
	}
</script>

<a href="/admin/register">Register</a>

<form on:submit|preventDefault={login} class="mx-auto w-full max-w-md space-y-4">
	<label class="label">
		<span class="label-text">Username</span>
		<input bind:value={username} type="text" name="Username" placeholder="  Enter username" />
	</label>
	<label class="label">
		<span class="label-text">Password</span>
		<input bind:value={password} type="password" name="Password" />
	</label>
	<input disabled={!username || !password} value="Login" type="Submit" />

	{#if error}
		<p class="text-red-500">{error}</p>
	{/if}
	{#if success}
		<p class="text-green-500">{success}</p>
	{/if}
</form>
