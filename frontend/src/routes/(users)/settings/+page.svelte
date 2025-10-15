<script lang="ts">
	import { page } from '$app/state';
	import { colours } from '$lib/state.svelte';
</script>

<div class="flex justify-center p-4" style="background-color: {colours.sidebar};">
	<ul class="text-lg">
		<li>Username: {page.data.user.data.username}</li>
		<li>Name: {page.data.user.data.name}</li>
		<li>Address: {page.data.user.data.address}</li>
		<li>Phone number: {page.data.user.data.phone_number}</li>
		<li>Email adress: {page.data.user.data.email_address}</li>
		<li>IBAN: {page.data.user.data.iban}</li>

		<a
			class="mt-8 flex justify-center rounded text-black"
			style="background-color: {colours.main};"
			href="/updateInfo"
		>
			Update information</a
		>
		<a
			class="mt-8 flex justify-center rounded text-black"
			style="background-color: {colours.main};"
			href="/settings/changePassword"
		>
			Change Password</a
		>
	</ul>
</div>
