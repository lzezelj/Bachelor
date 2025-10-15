<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { colours } from '$lib/state.svelte';
	import { tick } from 'svelte';
	let { data } = $props();
	let error = $state();
	let user = data.user.data;
	let username = $state(user.username);
	let password = $state();
	let name = $state(user.name);
	let address = $state(user.address);
	let phone_number = $state(user.phone_number);
	let email_address = $state(user.email_address);
	let IBAN = $state(user.iban);
	let popup = $state(false);
	function handleClickInside(event: MouseEvent) {
		event.stopPropagation();
	}
	async function update() {
		error = '';
		const res = await fetch('http://localhost:3000/api/update', {
			method: 'PUT',
			headers: { 'Content-Type': 'aplication/json' },
			body: JSON.stringify({
				username,
				password,
				name,
				address,
				phone_number,
				email_address,
				IBAN
			}),
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
	function sanitizeNumber(event: any) {
		if (phone_number < 0) {
			phone_number = 0;
		}
	}
</script>

<div class="flex justify-center p-4" style="background-color: {colours.sidebar};">
	<form onsubmit={update} class="mx-auto w-full max-w-md space-y-4 text-lg">
		<label class="label">
			<span class="label-text">Username</span>
			<input
				disabled
				bind:value={username}
				type="text"
				name="Username"
				placeholder={page.data.user.data.username}
			/>
		</label>
		<label class="label">
			<span class="label-text">Name</span>
			<input bind:value={name} type="text" name="Name" />
		</label>
		<label class="label">
			<span class="label-text">Address</span>
			<input bind:value={address} type="text" name="Address" />
		</label>
		<label class="label">
			<span class="label-text">Phone Number</span>
			<input
				bind:value={phone_number}
				inputmode="numeric"
				oninput={sanitizeNumber}
				type="number"
				name="Phone number"
			/>
		</label>
		<label class="label">
			<span class="label-text">Email Address</span>
			<input bind:value={email_address} type="email" name="Email address" />
		</label>
		<label class="label">
			<span class="label-text">IBAN</span>
			<input bind:value={IBAN} type="text" name="IBAN" placeholder={page.data.user.data.IBAN} />
		</label>
		<label class="label">
			<span class="label-text">Confirm Password</span>
			<input bind:value={password} type="password" name="Password" />
		</label>
		<input
			disabled={!username || !password}
			class="cursor-pointer"
			value="Update Information"
			type="Submit"
		/>
		{#if error}
			<p class="text-red-500">{error}</p>
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
			<h2 class="mb-2 text-xl text-black">Information updated successfully</h2>
			<p class="mb-2 text-black">
				Go back to <a href="/settings" class="text-blue-500">settings</a>
			</p>
		</div>
	</div>
{/if}
