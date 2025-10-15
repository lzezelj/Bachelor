<script lang="ts">
	const { listing, currentImage, selectImage } = $props<{
		listing: { image_path: string }[];
		currentImage: string;
		selectImage: (image: string) => void;
	}>();
</script>

{#if listing.length > 0}
	<section style="width: 40vw;">
		<header class="rounded-container overflow-hidden" style="width: 40vw; height: 40vh;">
			<img
				src={`http://localhost:3000/api/getImage?name=${currentImage}`}
				alt="Main"
				class="h-full w-full object-contain"
			/>
		</header>

		<div class="mt-2 flex gap-4 overflow-x-auto" style="width: 40vw;">
			{#each listing as picture}
				<button
					type="button"
					onclick={() => selectImage(picture.image_path)}
					aria-label="Select image"
					class="flex-shrink-0 focus:outline focus:outline-offset-2"
					style="width: calc(40vw / 5); height: calc(40vw / 5);"
				>
					<img
						src={`http://localhost:3000/api/getImage?name=${picture.image_path}`}
						alt="Thumbnail"
						class="rounded-container h-full w-full object-cover"
					/>
				</button>
			{/each}
		</div>
	</section>
{/if}
