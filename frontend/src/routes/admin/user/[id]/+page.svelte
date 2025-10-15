<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	export let data;
	let adminUsername = '';
	let adminPassword = '';
	let username = data.user[0].username;
	let name = data.user[0].name;
	let address = data.user[0].address;
	let phone_number = data.user[0].phone_number;
	let email_address = data.user[0].email_address;
	let IBAN = data.user[0].iban;
	async function update() {
		const res = await fetch('http://localhost:3000/api/adminUpdate', {
			method: 'PUT',
			headers: { 'Content-Type': 'aplication/json' },
			body: JSON.stringify({
				adminUsername,
				adminPassword,
				username,
				name,
				address,
				phone_number,
				email_address,
				IBAN
			}),
			credentials: 'include'
		});
		const data = await res.json();
		await invalidateAll();
	}
	function sanitizeNumber(event: any) {
		if (phone_number < 0) {
			phone_number = 0;
		}
	}
</script>

<br />

<form onsubmit={update} class="mx-auto w-full max-w-md space-y-4">
	<label class="label">
		<span class="label-text">Username</span>
		<input bind:value={username} type="text" name="Username" placeholder={data.user[0].username} />
	</label>
	<label class="label">
		<span class="label-text">Name</span>
		<input bind:value={name} type="text" name="Name" placeholder={data.user[0].name} />
	</label>
	<label class="label">
		<span class="label-text">Address</span>
		<input bind:value={address} type="text" name="Address" placeholder={data.user[0].address} />
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
		<input
			bind:value={email_address}
			type="email"
			name="Email address"
			placeholder={data.user[0].email_address}
		/>
	</label>
	<label class="label">
		<span class="label-text">IBAN</span>
		<input bind:value={IBAN} type="text" name="IBAN" placeholder={data.user[0].iban} />
	</label>
	<label class="label">
		<span class="label-text">Admin username</span>
		<input bind:value={adminUsername} type="text" name="Admin username" />
	</label>
	<label class="label">
		<span class="label-text">Admin password</span>
		<input bind:value={adminPassword} type="password" name="admin Password" />
	</label>

	<input type="Submit" />
</form>
