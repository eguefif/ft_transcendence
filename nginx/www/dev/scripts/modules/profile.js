import { fetcher } from "./fetcher.js"
import { renderer } from "./graphic-engine.js"
import { getSVG } from "./iconSVG.js"
import { sendFriendRequest } from "./friendSidebar.js"

export async function profile(username=undefined) {
	hidePong()
	let profile = document.getElementById("profileDiv")
	profile.classList.remove("d-none")
	if (!username)
		username = await getUsername()
	if (username == "error") {
		const games = {"error": "Problem while fetching data"}
		displayErrorProfile(games)
	}
	else {
		const games = await getGames(username)
		renderProfileStructure(username)
		renderStats(games)
		renderHistory(games)
	}
}

function hidePong() {
	renderer.hideBoard()
	renderer.hideBracket()
	const pongMenu = document.getElementById("pongMenu")
	pongMenu.innerHTML = ""
	const pongTournament = document.getElementById("playerForm")
	pongTournament.innerHTML = ""
}

export async function getUsername() {
	let msg = await fetcher.get("/api/profile/userinfo")
	let username = ""
	if (msg.status >= 200 && msg.status < 300)
		username = msg.data.username
	else{
		username = "error"
	}
	return username
}

async function getGames(username) {
	showSpinner()
	const games = await getGameHistoryData(username)
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
	const retval = await fetcher.get(`/api/profile/games?user=${username}`)
	let games = {}
	if (retval.status >= 300) {
		games["error"] = "bad request"
		return games
	}
	games = retval.data
	if ("error" in games)
		return games
	games = setStatusGame(games, username)
	games = transformDate(games)
	return games
}

function setStatusGame(games, username) {
	for (let [key, game] of Object.entries(games)) {
		let win = `<div class="p-1"><h5 class="text-success fs-3 fw-bold text-center">win</h5></div>`
		let loss = `<div class="p-1"><h5 class="text-danger fs-3 fw-bold text-center">loss</h5></div>`
		const addFriend = getSVG.addFriendSVG.addFriend
		if (!game["player2_add"])
			game["player2_add"] = addFriend
		else
			game["player2_add"] = ""
		if (!game["player1_add"])
			game["player1_add"] = addFriend
		else
			game["player1_add"] = ""
		if (game["player1"] === username) {
			if (game["score_player1"] == 3)
				game["status"] = win
			else 
				game["status"] = loss
		}
		else {
			if (game["score_player2"] == 3)
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
        let months = time.getMonth() + 1
        let monthsStr = ``
        if (months < 10)
            monthsStr = `0${months}`
        else
            monthsStr = `${months}`
        let days = time.getDate()
        let daysStr = ``
        if (days < 10)
            daysStr = `0${days}`
        else
            daysStr = `${days}`
		game["time"] = `${monthsStr}/${daysStr}/${time.getFullYear()} - ${time.getHours()}:${minutesStr}`
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
			<h5 class="text-danger fs-4 fw-bold text-center">${games.error}</h5>
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
	if (!("error" in games)) {
		for (const [key, game] of Object.entries(games)) {
			html += `
				<div class="row align-items-center bg-dark custom-opacity justify-content-around border border-primary border-3 rounded p-2 m-2">
					<div class="col-2"><img src="${game.avatar1}" class="img-fluid rounded float-left"></div>
					<div class="col-3">
						<div class="d-flex flex-column">
							<div class="p-1">
								<h5 class="text-primary user-link fs-4 fw-bold text-center">
									<span>${game.player1}</span>${generateAddFriendLink(game.player1, game.player1_add)}
								</h5></div>
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
							<div class="p-1"><h5 class="text-primary user-link fs-4 fw-bold text-center">
							<span>${game.player2}</span>${generateAddFriendLink(game.player2, game.player2_add)}</h5></div>
							<div class="p-1"><h5 class="text-secondary fs-3 fw-bold text-center">${game.score_player2}</h5></div>
						</div>
					</div>
					<div class="col-2"><img src="${game.avatar2}" class="img-fluid rounded float-right"></div>
				</div>
			`
		}
	}
	else {
		html += `<div class="container p-3 border fs-3 border-primary border-rounded border-3 bg-dark text-danger">No game played yet</div>`
	}
	html +=`
		</div>
		`
	history.innerHTML = html
	addUserLinks()
	addEventListenerAddFriend()
}

function addUserLinks() {
	const links = document.getElementById("match-history").querySelectorAll(".user-link")
	links.forEach((link) => {
		link.querySelector("span").addEventListener("click", () => {
			profile(link.innerText.trim())
		})
	})
}

function generateAddFriendLink(name, svg) {
	if (svg == "")
		return ``
	return `
		<a href="" value="${name}" class="btn btn-primary mx-1" addFriendBtn>${svg}</a>
	`
}

function addEventListenerAddFriend() {
	const history = document.getElementById("history")
	if (history != undefined)
		history.addEventListener("click", eventAddFriend);
}

async function eventAddFriend(e) {
	if (e.target.matches("[addFriendBtn]")) {
		e.preventDefault()
		const username = e.target.getAttribute("value")
		await sendFriendRequest(username)
	}
}
