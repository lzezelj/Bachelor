export async function load({ fetch }) {
	const res = await fetch('http://localhost:3000/api/admin', {
		method: 'GET',
		credentials: 'include'
	});

	let user = null;

	if (res.ok) {
		const data = await res.json();
		if (data.loggedIn) {
			user = data;
		}
	}
	return { user };
}
