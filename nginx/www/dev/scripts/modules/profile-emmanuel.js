import { fetcher } from "../modules/fetcher.js"

export async function profile() {
	let msg = await fetcher.get("/api/userinfo")
	username = msg.data.username
	if (msg.status != 200)
		return {"error": "problem while fetching data"}
	let data = await getData(username)
	if ("error" in data) {
		displayErrorProfile(data)
	}
	else {
		renderProfileStructure(username)
		renderStats(data)
		renderHistory(data)
	}
}

function getData(username) {
	showSpinner()
	let data = getGameHistoryData(username)
	return data
}

function showSpinner() {
	let main_frame = document.getElementById("main_frame")
	main_frame.innerHTML = `
		<div class="d-flex justify-content-center mt-5">
			<div class="spinner-border text-primary" role="status">
				<span class="visually-hidden"></span>
			</div>
		</div>
	`
}

async function getGameHistoryData(username) {
	let retval = await fetcher.get("/api/profile/getprofile")
	let data = {}
	if (retval.status == 200)
		data = retval.data
	else {
		data = {"error": "Impossible to load data"}
		return data
	}
	data = setStatusGame(data, username)
	if ("error" in data)
		return data
	data = transformDate(data)
	return data
}

function setStatusGame(data, username) {
	for (const [key, game] of Object.entries(data)) {
    let win = `<div class="p-1"><h5 class="text-success fs-3 fw-bold text-center">win</h5></div>`
    let loss = `<div class="p-1"><h5 class="text-danger fs-3 fw-bold text-center">loss</h5></div>`
		if (game.player1 === username) {
			if (game.score_player1 == 3)
				game["status"] = win
			else
				game["status"] = loss
		}
		else {
			if (game.score_player2 == 3)
				game["status"] = win
			else
				game["status"] = loss
		}
	}
	return data
}

function transformDate(data) {
	let time = 0
	let minutes = 0
	let minutesStr = ''
	for (const [key, game] of Object.entries(data)) {
		time = new Date(game["time"] * 1000)
        minutes = time.getMinutes()
        minutesStr = ``
        if (minutes < 10)
            minutesStr = `0${minutes}`
        else
            minutesStr = `${minutes}`
		game["time"] = `${time.getMonth()}/${time.getDay()}/${time.getFullYear()} - ${time.getHours()}:${minutesStr}`
	}
	return data
}

function renderProfileStructure(username) {
	let main_frame = document.getElementById("main_frame")
	main_frame.innerHTML = `
    <h3 class="text-primary fs-1 fw-bold text-center">${username}</h3>
    <section id="stats" class="p-4">
    </section> 
    <hr class="w-25 mx-auto"/>
    <section id="history" class="p-4">
	</section>
	`
}

function displayErrorProfile(data) {
	let main_frame = document.getElementById("main_frame")
	main_frame.innerHTML = `
		<div class="d-flex justify-content-center mt-5">
			<h5 class="text-danger fs-2 fw-bold text-center">${data.error}</h5>
		<div>
	`
}

function renderStats(games) {
	let stats = document.getElementById("stats")
	let data = getStats(games)
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

function getStats(data) {
	let winrate = 0
	let nbr_games = 0
	let losses = 0
	let wins = 0
	
	for (const [key, game] of Object.entries(data)) {
		nbr_games++
		if (game["status"].includes("win"))
			wins++
		else
			losses++
	}
	winrate = Math.round(wins / nbr_games * 100)

	let retval = {
		"winrate": winrate,
		"nbr_games": nbr_games,
		"wins": wins,
		"losses": losses
	}
	return retval
}

function renderHistory(games) {
	let stats = document.getElementById("history")
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
                        <div class="p-1"><h5 class="text-secondary fs-3 fw-bold text-center">${game.score_player1}</h5></div>
                    </div>
                </div>
                <div class="col-2">
                    <div class="d-flex align-items-center flex-column">
                        <div class="p-1">${game.status}</h5></div>
                        <div class="p-1"><h5 class="fs-6 text-center">${game.time}</h5></div>
                    </div>
                </div>
                <div class="col-3">
                    <div class="d-flex flex-column">
                        <div class="p-1"><h5 class="text-primary fs-4 fw-bold text-center">${game.player2}</h5></div>
                        <div class="p-1"><h5 class="text-secondary fs-3 fw-bold text-center">${game.score_player2}</h5></div>
                    </div>
                </div>   
                <div class="col-2"><img src="${game.avatar2}" class="img-fluid rounded float-right"></div>
            </div>
		`
	}
	stats.innerHTML = html
}
