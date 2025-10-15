<script lang="ts">
	import { goto } from '$app/navigation';
	import { colours } from '$lib/state.svelte';
	let usernameMissing = '';
	let username = '';
	let password = '';
	let error = '';
	let success = '';
	let passwordMissing = '';
	async function login() {
		error = '';
		usernameMissing = '';
		passwordMissing = '';
		if (username == '') {
			usernameMissing = 'Username is required';
			return;
		}
		if (password == '') {
			passwordMissing = 'Password is required';
			return;
		}
		const res = await fetch('http://localhost:3000/api/login', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ username, password }),
			credentials: 'include'
		});
		const data = await res.json();
		if (res.ok) {
			success = 'Registration successful';
			await goto('/homepage', { replaceState: true, invalidateAll: true });
		} else {
			error = data.error || 'Something went wrong';
		}
	}
</script>

<div class="flex justify-center p-4" style="background-color: {colours.sidebar};">
	<form onsubmit={login} class="mx-auto w-full max-w-md space-y-4">
		<label class="label">
			<span class="label-text">Username</span>
			<input bind:value={username} type="text" name="Username" placeholder="  Enter username" />
			<div class="text-red-500">{usernameMissing}</div>
		</label>
		<label class="label">
			<span class="label-text">Password</span>
			<input bind:value={password} type="password" name="Password" />
			<div class="text-red-500">{passwordMissing}</div>
		</label>
		<input type="Submit" value="Login" />
		<br />
		Dont have an account? <a href="/register" class="text-blue-500">Register</a>
		{#if error}
			<p class="text-red-500">{error}</p>
		{/if}
	</form>
</div>
