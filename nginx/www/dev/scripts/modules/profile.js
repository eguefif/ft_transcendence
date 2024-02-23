import { fetcher } from "./fetcher.js"
import { renderer } from "./graphic-engine.js"

export async function profile() {
	hidePong()
	const username = await getUsername()
	let games ={}
	if (username == "error") {
		games = {"error": "Problem while fetching data"}
		displayErrorProfile(games)
	}
	else {
		games = await getData(username)
		renderProfileStructure(username)
		renderStats(games)
		renderHistory(games)
	}
}

function hidePong() {
	renderer.hideBoard()
	let pongMenu = document.getElementById("pongMenu")
	pongMenu.innerHTML = ""
}

async function getUsername() {
	let msg = await fetcher.get("/api/userinfo")
	let username = ""
	if (msg.status >= 200 && msg.status < 300)
		username = msg.data.username
	else{
		username = "error"
		console.log("Error in getuesrname")
	}
	return username
}

function getData(username) {
	showSpinner()
	let games = getGameHistoryData(username)
	return games
}

export function showSpinner() {
	let profile = document.getElementById("profileDiv")
	profile.innerHTML = `
		<div class="d-flex justify-content-center mt-5">
			<div class="spinner-border text-primary" role="status">
				<span class="visually-hidden"></span>
			</div>
		</div>
	`
}

async function getGameHistoryData(username) {
	let retval = await fetcher.get("/api/profile/getprofile")
	let games = {}
	if (retval.status >= 200 && retval.status < 300)
		games = retval.data
	else {
		games = retval.data
		return games
	}
	games = setStatusGame(games, username)
	if ("error" in games)
		return games
	games = transformDate(games)
	return games
}

function setStatusGame(games, username) {
	for (const [key, game] of Object.entries(games)) {
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
	return games
}

function transformDate(games) {
	let time = 0
	let minutes = 0
	let minutesStr = ''
	for (const [key, game] of Object.entries(games)) {
		time = new Date(game["time"] * 1000)
        minutes = time.getMinutes()
        minutesStr = ``
        if (minutes < 10)
            minutesStr = `0${minutes}`
        else
            minutesStr = `${minutes}`
		game["time"] = `${time.getMonth()}/${time.getDay()}/${time.getFullYear()} - ${time.getHours()}:${minutesStr}`
	}
	return games
}

function renderProfileStructure(username) {
	let profile = document.getElementById("profileDiv")
	profile.innerHTML = `
	<div id="profile">
		<h3 class="text-primary py-3 fs-1 fw-bold text-center">${username}</h3>
		<hr class="w-25 border border-1 border-primary mx-auto text-primary"/>
        <h3 class="text-primary fs-2 fw-bold px-5">Stats</h3>
		<div id="stats" class="p-4">
		</div>
		<hr class="w-25 border border-1 border-primary mx-auto text-primary"/>
        <h3 class="text-primary p-2 fs-2 fw-bold px-5">History</h3>
		<div id="history" class="p-4">
		</div>
	</div>
	`
}

function displayErrorProfile(games) {
	let profile = document.getElementById("profileDiv")
	profile.innerHTML = `
		<div class="d-flex justify-content-center mt-5">
			<h5 class="text-danger fs-2 fw-bold text-center">${games.error}</h5>
		<div>
	`
}

function renderStats(games) {
	let stats_div = document.getElementById("stats")
	let stats = getStats(games)
	stats_div.innerHTML = `
        <div id="profile-stats" class="container text-center">
            <div class="d-flex justify-content-around">
                <div class="card border border-3 bg-dark custom-opacity border-primary rounded-pill" style="width: 10rem">
                    <div class="card-body text-secondary">
                        <h5 class="card-title">Winrate</h5>
                        <p class="card-body fs-4">${stats.winrate}%</p>
                    </div>
                </div>
                <div class="card border border-3 bg-dark custom-opacity border-primary rounded-pill" style="width: 10rem">
                    <div class="card-body text-secondary">
                        <h5 class="card-title">Games</h5>
                        <p class="card-body fs-4">${stats.nbr_games}</p>
                    </div>
                </div>
                <div class="card border border-3 bg-dark custom-opacity border-primary rounded-pill" style="width: 10rem">
                    <div class="card-body text-secondary">
                        <h5 class="card-title">Wins</h5>
                        <p class="card-body fs-4">${stats.wins}</p>
                    </div>
                </div>
                <div class="card border border-3 bg-dark custom-opacity border-primary rounded-pill" style="width: 10rem">
                    <div class="card-body text-secondary">
                        <h5 class="card-title">Losses</h5>
                        <p class="card-body fs-4">${stats.losses}</p>
                    </div>
                </div>
            </div>
        </div>
    </section>
		`
}

function getStats(games) {
	let winrate = 0
	let nbr_games = 0
	let losses = 0
	let wins = 0

	for (const [key, game] of Object.entries(games)) {
		nbr_games++
		if (game["status"].includes("win"))
			wins++
		else
			losses++
	}
	winrate = Math.round(wins / nbr_games * 100)

	if (!("error" in games)) {
		for (const [key, game] of Object.entries(games)) {
			nbr_games++
			if (game["status"].includes("win"))
				wins++
			else
				losses++
		}
		winrate = Math.round(wins / nbr_games * 100)
	}

	let retval = {
		"winrate": winrate,
		"nbr_games": nbr_games,
		"wins": wins,
		"losses": losses
	}
	return retval
}

function renderHistory(games) {
	let history = document.getElementById("history")
	let html = `
        <div id="match-history" class="container text-center">
	`
	for (const [key, game] of Object.entries(games)) {
		html += `
            <div class="row align-items-center bg-dark custom-opacity justify-content-around border border-primary border-3 rounded p-2 m-2">
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
                        <div class="p-1"><h5 class="fs-6 text-center text-secondary">${game.time}</h5></div>
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
	html +=`
		</div>
		`
	history.innerHTML = html
}