import { countListings, fetchSubcategories, formatDate } from '$lib/counterCalculator.js';
import { redirect } from '@sveltejs/kit';

export async function load({ fetch }) {
	const res = await fetch('http://localhost:3000/api/me', {
		method: 'GET',
		credentials: 'include'
	});
	let isMobile = false;
	if (typeof navigator !== 'undefined') {
		isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
	}
	if (isMobile) {
		throw redirect(301, '/mobile/homepage');
	}
	let user = null;
	let allListings;
	let conditions;
	let categories;
	let subcategories: any = [];
	let counts: any = [];
	let shoppingCart;
	let allListingsFiltered;
	let totalPrice;
	if (res.ok) {
		const data = await res.json();
		if (data.loggedIn) {
			user = data;
		}
	}

	const allList = await fetch('http://localhost:3000/api/getAllListings', {
		method: 'GET',
		credentials: 'include'
	});
	if (allList.ok) {
		const data = await allList.json();
		allListings = data.listing;
	} else {
		console.error('Failed to fetch listings');
	}

	const cond = await fetch('http://localhost:3000/api/getConditions', {
		method: 'GET',
		credentials: 'include'
	});
	if (cond.ok) {
		const data = await cond.json();
		conditions = data.conditions;
	} else {
		console.error('Failed to fetch conditions');
	}
	const cat = await fetch('http://localhost:3000/api/getCategories', {
		method: 'GET',
		credentials: 'include'
	});
	if (cat.ok) {
		const data = await cat.json();
		categories = data.categories;
	} else {
		console.error('Failed to fetch categories');
	}
	allListingsFiltered = Array.from(
		new Map(allListings.map((item: { id: any }) => [item.id, item])).values()
	);
	for (const category of categories) {
		subcategories[category.id] = await fetchSubcategories(fetch, category.category);
	}
	allListingsFiltered = formatDate(allListingsFiltered);
	counts = await countListings(allListingsFiltered);
	if (user) {
		totalPrice = 0;
		const resCart = await fetch('http://localhost:3000/api/getShoppingCart', {
			method: 'POST',
			credentials: 'include',
			body: String(user.data.id)
		});

		const cart = await resCart.json();
		if (resCart.ok) {
			shoppingCart = cart.shoppingCart;
			if (shoppingCart[0] && !shoppingCart[1]) {
				totalPrice = parseFloat(shoppingCart[0].price);
			} else if (shoppingCart[1]) {
				totalPrice = shoppingCart.reduce(
					(sum: any, item: any) => parseFloat(sum.price) + parseFloat(item.price)
				);
			}
		}
	}

	return {
		user,
		categories,
		conditions,
		allListingsFiltered,
		subcategories,
		counts,
		shoppingCart,
		totalPrice
	};
}
