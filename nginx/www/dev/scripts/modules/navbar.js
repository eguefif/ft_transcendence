const nav = `
	<nav class="navbar navbar-expand-sm sticky-top bg-dark">
		<div class="container-fluid">
			<a class="navbar-brand test" href="#">
				<img src="images/logo.png" alt="" width="150" />
			</a>
			<button
				class="test navbar-toggler opacity-100"
				type="button"
				data-bs-toggle="collapse"
				data-bs-target="#navbarNavDropdown"
				aria-controls="navbarNavDropdown"
				aria-expended="false"
				aria-label="Toggle navigation"
				>
				<span class="navbar-toggler-icon"></span>
			</button>
			<div class="collapse navbar-collapse" id="navbarNavDropdown">
			</div>
		</div>
	</nav>
`

export function createNavBar () {
	document.querySelector('body').insertAdjacentHTML("afterbegin", nav);
}