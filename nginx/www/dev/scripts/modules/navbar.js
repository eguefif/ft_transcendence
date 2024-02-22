const nav = `
	<nav class="navbar navbar-expand-sm sticky-top bg-dark">
		<div class="container-fluid">
			<a class="navbar-brand" href="/">
				<img src="images/logo.png" alt="" width="150" />
			</a>
			<div id="navBarButton">
			</div>
		</div>
	</nav>
`

export function createNavBar () {
	document.querySelector('body').insertAdjacentHTML("afterbegin", nav);
}