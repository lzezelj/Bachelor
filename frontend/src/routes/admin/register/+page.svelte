<script lang="ts">
	import { goto } from '$app/navigation';

	let username = '';
	let password = '';
	let confirmPassword = '';
	let error = '';
	let success = '';

	async function register() {
		error = '';
		success = '';
		if (password !== confirmPassword) {
			error = 'Passwords do not match';
			return;
		}
		const res = await fetch('http://localhost:3000/api/adminRegister', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ username, password }),
			credentials: 'include'
		});
		const data = await res.json();
		if (res.ok) {
			success = 'Registration successful';
			goto('/admin/login');
		} else {
			error = data.error || 'Something went wrong';
		}
	}
</script>

<a href="/admin/login">Login</a>

<form on:submit|preventDefault={register} class="mx-auto w-full max-w-md space-y-4">
	<label class="label">
		<span class="label-text">Username</span>
		<input bind:value={username} type="text" name="Username" placeholder="  Enter username" />
	</label>
	<label class="label">
		<span class="label-text">Password</span>
		<input bind:value={password} type="password" name="Password" />
	</label>
	<label class="label">
		<span class="label-text">Confirm password</span>
		<input bind:value={confirmPassword} type="password" name="Confirm password" />
	</label>
	<p class="text-red-500">{error}</p>
	<br />
	<input
		disabled={!username || !password || !confirmPassword}
		class="cursor-pointer"
		type="Submit"
		value="Register"
	/>
</form>
