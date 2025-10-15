<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { onMount } from 'svelte';
	let users = $state<any>();
	let selectedUsersId = $state(new Set<number>());
	async function getUsers() {
		const res = await fetch('http://localhost:3000/api/getUsers', {
			method: 'GET',
			credentials: 'include'
		});
		if (res.ok) {
			const data = await res.json();
			users = data.users;
		} else {
			console.error('Failed to fetch listings');
		}
	}
	async function deleteUsers() {
		const res = await fetch('http://localhost:3000/api/deleteUsers', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ selectedUsersId: Array.from(selectedUsersId) }),
			credentials: 'include'
		});
		const data = await res.json();
		if (res.ok) {
			selectedUsersId.clear();
			await invalidateAll();
		}
	}
	function toggleSelectionUsers(id: number) {
		if (selectedUsersId.has(id)) {
			selectedUsersId.delete(id);
		} else {
			selectedUsersId.add(id);
		}
		selectedUsersId = new Set(selectedUsersId);
	}
	onMount(() => {
		getUsers();
	});
</script>

<div class="grid w-full grid-cols-5 gap-6 text-center">
	{#each users as user}
		<div class="card items-center justify-center p-4">
			<input
				type="checkbox"
				checked={selectedUsersId.has(user.id)}
				onchange={() => toggleSelectionUsers(user.id)}
			/>
			<a href="/admin/user/{user.id}">{user.username}</a>
		</div>
	{/each}
</div>
<button onclick={deleteUsers} disabled={selectedUsersId.size === 0}> Delete Selected Users</button>
