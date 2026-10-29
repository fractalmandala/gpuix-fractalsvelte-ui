<script lang="ts">
	// Markup is a string so the renderer draws it through <svg source>, as Checkbox does.
	const SOURCE = "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"> <path d=\"M6 3H18C19.6569 3 21 4.34315 21 6V18C21 19.6569 19.6569 21 18 21H6C4.34315 21 3 19.6569 3 18V6C3 4.34315 4.34315 3 6 3ZM9 3V21\"/> </svg>";
</script>

<svg source={SOURCE} class="icon"></svg>

<style>
	.icon { width: 16px; height: 16px; }
</style>
