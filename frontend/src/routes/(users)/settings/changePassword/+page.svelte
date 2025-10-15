<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { colours } from '$lib/state.svelte';
	import { tick } from 'svelte';
	let oldPassword: any;
	let newPasswordConfirm: any;
	let newPassword: any;
	let error: any;
	let popup = false;
	let user_id = page.data.user.data.id;
	let passwordMissing: any;
	let newPasswordMissing: any;
	async function changePassword() {
		passwordMissing = '';
		newPasswordMissing = '';
		if (!oldPassword) {
			passwordMissing = 'Password is required';
			return;
		}
		if (!newPassword) {
			newPasswordMissing = 'Password is required';
			return;
		}
		if (newPassword != newPasswordConfirm) {
			error = 'Passwords dont match';
			return;
		}
		const res = await fetch('http://localhost:3000/api/changePassword', {
			method: 'POST',
			credentials: 'include',
			body: JSON.stringify({ oldPassword, newPassword, user_id })
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
	<form onsubmit={changePassword} class="mx-auto w-full max-w-md space-y-4">
		<label class="label">
			<span class="label-text">Old Password</span>
			<input bind:value={oldPassword} type="password" />
			<div class="text-red-500">{passwordMissing}</div>
		</label>
		<label class="label">
			<span class="label-text">New Password</span>
			<input bind:value={newPassword} type="password" />
			<div class="text-red-500">{newPasswordMissing}</div>
		</label>
		<label class="label">
			<span class="label-text">Confirm New Password</span>
			<input bind:value={newPasswordConfirm} type="password" />
		</label>
		{#if error}
			<p class="text-red-500">{error}</p>
		{/if}
		<input type="Submit" value="Change Password" />
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
			<h2 class="mb-2 text-xl text-black">Password changed successfully</h2>
			<p class="mb-2 text-black">
				Go back to <a href="/settings" class="text-blue-500">settings</a>
			</p>
		</div>
	</div>
{/if}
