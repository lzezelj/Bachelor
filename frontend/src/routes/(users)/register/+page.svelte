<script lang="ts">
	import { goto } from '$app/navigation';
	import { colours } from '$lib/state.svelte';
	import { tick } from 'svelte';

	let username = '';
	let password = '';
	let confirmPassword = '';
	let error = '';
	let wrongPassword = '';
	let passwordMissing = '';
	let usernameMissing = '';
	let popup = false;
	async function register() {
		error = '';
		wrongPassword = '';
		passwordMissing = '';
		usernameMissing = '';
		if (username == '') {
			usernameMissing = 'Username is required';
			return;
		}
		if (password !== confirmPassword) {
			wrongPassword = 'Passwords do not match';
			return;
		}
		if (password == '') {
			passwordMissing = 'Password is required';
			return;
		}

		const res = await fetch('http://localhost:3000/api/register', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ username, password }),
			credentials: 'include'
		});
		const data = await res.json();
		if (res.ok) {
			popup = true;
			await tick();
			document.getElementById('popup-overlay')?.focus();
		} else {
			error = data.error || 'Something went wrong';
		}
	}
	function handleClickInside(event: MouseEvent) {
		event.stopPropagation();
	}
</script>

<div class="flex justify-center p-4" style="background-color: {colours.sidebar};">
	<form onsubmit={register} class="mx-auto w-full max-w-md space-y-4">
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
		<label class="label">
			<span class="label-text">Confirm password</span>
			<input bind:value={confirmPassword} type="password" name="Confirm password" />
		</label>
		<input class="cursor-pointer" type="Submit" value="Register" /><br />
		{#if error}
			<p class="text-red-500">{error}</p>
		{/if}
		{#if wrongPassword}
			<p class="text-red-500">{wrongPassword}</p>
		{/if}
	</form>
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
			<h2 class="mb-2 text-xl text-black">Registration successful</h2>
			<p class="mb-2 text-black">Please go <a href="/login" class="text-blue-500">login</a></p>
		</div>
	</div>
{/if}
