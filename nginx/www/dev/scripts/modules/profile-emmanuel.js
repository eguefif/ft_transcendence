export function profile() {
	renderProfileStructure()
	renderStats()
	renderHistory()
}

function renderProfileStructure() {
	let main_frame = document.getElementById("main_frame")
	main_frame.innerHTML = `

    <h3 class="text-primary fs-1 fw-bold text-center">Profile</h3>
    <section id="stats" class="p-4">
    </section> 
    <hr class="w-25 mx-auto"/>
    <section id="history" class="p-4">
	</section>
	`
}

function getStats() {
	let retval = {
		"winrate": 55,
		"nbr_games": 100,
		"wins": 55,
		"losses": 45
	}
	return retval
}

function renderStats() {
	let stats = document.getElementById("stats")
	const data = getStats()
	stats.innerHTML = `
        <h3 class="text-primary fs-2 fw-bold px-5">Stats</h3>
        <div id="profile-stats" class="container text-center">
 
            <div class="d-flex justify-content-around">
                <div class="card border bg-light border-primary rounded-pill" style="width: 10rem">
                    <div class="card-body">
                        <h5 class="card-title">Winrate</h5>
                        <p class="card-body">${data.winrate}%</p>
                    </div>
                </div>
                <div class="card border bg-light border-primary rounded-pill" style="width: 10rem">
                    <div class="card-body">
                        <h5 class="card-title">Games played</h5>
                        <p class="card-body">${data.nbr_games}</p>
                    </div>
                </div>
                <div class="card border bg-light border-primary rounded-pill" style="width: 10rem">
                    <div class="card-body">
                        <h5 class="card-title">Wins</h5>
                        <p class="card-body">${data.wins}</p>
                    </div>
                </div>
                <div class="card border bg-light border-primary rounded-pill" style="width: 10rem">
                    <div class="card-body">
                        <h5 class="card-title">Loss</h5>
                        <p class="card-body">${data.losses}</p>
                    </div>
                </div>
            </div>
        </div>
    </section> 
		`
}

function getGameHistoryData() {
	let username = "Robert"
	let retval = {1:
		{"player1": "Robert",
		"avatar1": "https://www.google.com/url?sa=i&url=https%3A%2F%2Ficonscout.com%2Ficons%2Favatar&psig=AOvVaw2jyK1M_RZmGD-K3567u3-d&ust=1708553928047000&source=images&cd=vfe&opi=89978449&ved=0CBMQjRxqFwoTCKDKqcH5uoQDFQAAAAAdAAAAABAI",
		"avatar2": "https://www.google.com/url?sa=i&url=https%3A%2F%2Ficonscout.com%2Ficons%2Favatar&psig=AOvVaw2jyK1M_RZmGD-K3567u3-d&ust=1708553928047000&source=images&cd=vfe&opi=89978449&ved=0CBMQjRxqFwoTCKDKqcH5uoQDFQAAAAAdAAAAABAY", 
		"player2": "Georgia",	
		"score1": 3,
		"score2": 1,
		"date": "23 janvier 2923 11h33"},

		2:{"player1": "Henry",
		"avatar1": "https://www.google.com/url?sa=i&url=https%3A%2F%2Ficonscout.com%2Ficons%2Favatar&psig=AOvVaw2jyK1M_RZmGD-K3567u3-d&ust=1708553928047000&source=images&cd=vfe&opi=89978449&ved=0CBMQjRxqFwoTCKDKqcH5uoQDFQAAAAAdAAAAABAI",
		"avatar2": "https://www.google.com/url?sa=i&url=https%3A%2F%2Ficonscout.com%2Ficons%2Favatar&psig=AOvVaw2jyK1M_RZmGD-K3567u3-d&ust=1708553928047000&source=images&cd=vfe&opi=89978449&ved=0CBMQjRxqFwoTCKDKqcH5uoQDFQAAAAAdAAAAABAY", 
		"player2": "Robert",	
		"score1": 3,
		"score2": 1,
		"data": "23 janvier 1984 15h15"},
		3: {"player1": "Jo",
		"avatar1": "https://www.google.com/url?sa=i&url=https%3A%2F%2Ficonscout.com%2Ficons%2Favatar&psig=AOvVaw2jyK1M_RZmGD-K3567u3-d&ust=1708553928047000&source=images&cd=vfe&opi=89978449&ved=0CBMQjRxqFwoTCKDKqcH5uoQDFQAAAAAdAAAAABAI",
		"avatar2": "https://www.google.com/url?sa=i&url=https%3A%2F%2Ficonscout.com%2Ficons%2Favatar&psig=AOvVaw2jyK1M_RZmGD-K3567u3-d&ust=1708553928047000&source=images&cd=vfe&opi=89978449&ved=0CBMQjRxqFwoTCKDKqcH5uoQDFQAAAAAdAAAAABAY", 
		"player2": "Robert",	
		"score1": 3,
		"score2": 2,
		"date": "23 janvier 1984 10h11"},
	}
	retval = setStatusGame(retval, username)
	return retval
}

function setStatusGame(retval, username) {
	for (const [key, game] of Object.entries(retval)) {
    let win = `<div class="p-1"><h5 class="text-success fs-3 fw-bold text-center">win</h5></div>`
    let loss = `<div class="p-1"><h5 class="text-danger fs-3 fw-bold text-center">loss</h5></div>`
		if (game.player1 === username) {
			if (game.score1 == 3)
				game["status"] = win
			else
				game["status"] = loss
		}
		else {
			if (game.score2 == 3)
				game["status"] = win
			else
				game["status"] = loss
		}
	}
	return retval
}

function renderHistory() {
	let stats = document.getElementById("history")
	const games = getGameHistoryData()
	console.log(games)
	let html = `
        <h3 class="text-primary fs-2 fw-bold px-5">History</h3>
        <div class="container text-center">
	`
	for (const [key, game] of Object.entries(games)) {
		html += `
            <div class="row  align-items-center bg-light justify-content-around border border-primary rounded p-2 m-2">
                <div class="col-2"><img src="${game.avatar1}" class="img-fluid rounded float-left"></div>
                <div class="col-3">
                    <div class="d-flex flex-column">
                        <div class="p-1"><h5 class="text-primary fs-4 fw-bold text-center">${game.player1}</h5></div>
                        <div class="p-1"><h5 class="text-secondary fs-3 fw-bold text-center">${game.score1}</h5></div>
                    </div>
                </div>
                <div class="col-2">
                    <div class="d-flex align-items-center flex-column">
                        <div class="p-1">${game.status}</h5></div>
                        <div class="p-1"><h5 class="fs-6 text-center">${game.date}</h5></div>
                    </div>
                </div>
                <div class="col-3">
                    <div class="d-flex flex-column">
                        <div class="p-1"><h5 class="text-primary fs-4 fw-bold text-center">${game.player2}</h5></div>
                        <div class="p-1"><h5 class="text-secondary fs-3 fw-bold text-center">${game.score2}</h5></div>
                    </div>
                </div>   
                <div class="col-2"><img src="${game.avatar2}" class="img-fluid rounded float-right"></div>
            </div>
		`
	}
	stats.innerHTML = html
}
