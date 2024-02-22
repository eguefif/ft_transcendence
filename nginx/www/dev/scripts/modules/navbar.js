const nav = `
	<nav class="navbar navbar-expand-sm sticky-top bg-dark">
		<div class="container-fluid">
			<a class="navbar-brand" href="/" data-link>
				<img src="images/logo.png" class="nav noclick" alt="" width="150" />
			</a>
			<div id="navBarButton">
			</div>
		</div>
	</nav>
`

export function createNavBar () {
	document.querySelector('body').insertAdjacentHTML("afterbegin", nav);
}