import { fetcher } from "./fetcher.js";
import { getSVG } from "./iconSVG.js";

async function deleteFriendship(username) {
    const body = {"username": username}
    const res = await fetcher.post("api/delete_friendship/", body)
}

export async function sendFriendRequest(username) {
    const body = {"username": username}
    const res = await fetcher.post("api/send_friend_request/", body)
}

async function acceptFriendRequest(username) {
    const body = {"username": username}
    const res = await fetcher.post("api/accept_friend_request/", body)
    if (res.status != 200)
        return false
    return true
}

async function declineFriendRequest(username) {
    const body = {"username": username}
    const res = await fetcher.post("api/decline_friend_request/", body)
    if (res.status != 200)
        return false
    return true
}

function makeFriendRequestElement(username) {
    return `
        <li class="nav-item" style="margin: 0px;">
            <div class="row align-items-center">
                <div class="col-auto">
                    <a href="" class="nav-link" aria-current="page">${username}</a>
                </div>
                <div class="col">
                    <a name="accept-${username}" class="btn btn-sm btn-success btn-friend-request">Accept</a>
                    <a name="decline-${username}" class="btn btn-sm btn-danger btn-friend-request">Decline</a>
                </div>
            </div>
        </li>
    `
}

function createStatusBage(onlineStatus) {
    let colorClasses = ""
    switch (onlineStatus) {
        case "Online":
            colorClasses = "text-bg-success"
            break;
        case "Offline":
            colorClasses = "text-bg-light"
            break;
        case "Away":
            colorClasses = "text-bg-warning"
            break;
        case "Playing":
            colorClasses = "text-bg-info"
            break;
        default:
            break;
    }

    return `
        <span class="badge rounded-pill ${colorClasses}">${onlineStatus}</span>
    `
}

function makeFriendElement(username, onlineStatus) {
    return `
        <li class="nav-item" style="margin: 0px;">
            <div class="row align-items-center">
                <div class="col-auto">
                    <div class="nav-link noclick" aria-current="page">${username} ${createStatusBage(onlineStatus)}</div>
                </div>
                <div class="col">
                    <a name="delete-${username}" class="btn btn-sm btn-danger btn-delete-friend">Delete</a>
                </div>
            </div>
        </li>
    `
}

async function getFriendRequests() {
    const res = await fetcher.get("api/get_friend_requests/")

    if (res.status != 200)
        return ""

    let friendRequestElements = ""
    for (let i = 0; i < res.data.length; i++) {
        let user = res.data[i]
        friendRequestElements += makeFriendRequestElement(user['username'])
    }
    return friendRequestElements
}

async function getFriendList() {
	if (!fetcher.isAuthenticated())
		return ""
    const res = await fetcher.get("api/get_friend_list")

    if (res.status != 200)
        return ""

    let friendsListElements = ""
    for (let i = 0; i < res.data.length; i++) {
        let user = res.data[i]
        friendsListElements += makeFriendElement(user['username'], user['online_status'])
    }
    return friendsListElements
}

function connectWebsocket() {
	const hostname = window.location.hostname
    let ws = new WebSocket(`wss://${hostname}/online_status/`)

	document.addEventListener("startGame", (e) => {
		ws.send(JSON.stringify({"message": "Game started"}))
	})

	document.addEventListener("endGame", (e) => {
		ws.send(JSON.stringify({"message": "Game ended"}))
	})

	const logoutBtn = document.getElementById("logoutButton");
	if (logoutBtn != undefined) {
		logoutBtn.addEventListener("click", (e) => {
			ws.close()
		})
	}

	ws.onopen = async function(e) {
		await fetcher.sendToken(ws)
        ws.send(JSON.stringify({
            "message": "online",
        }))
	}

	ws.onmessage = async function(e) {
		if (e.data == "Friend added" || e.data == "Friend request sent") {
			const friendBtn = document.getElementById("textFriendBtn")
			if (friendBtn != undefined) {
				if (!friendBtn.innerHTML.includes("alertNotification")) {
					friendBtn.innerHTML += `
		  <span id="alertNotification" class="position-absolute top-0 start-10 translate-middle p-1 bg-danger border border-dark rounded-circle">
		  </span>
		  `
					friendBtn.addEventListener("click", (e) => {
						let alertNotification = document.getElementById("alertNotification")
						if (alertNotification != null) {
							alertNotification.remove()
						}
					})
				}
			}
		}

        if (e.data == 'server:Game started')
        {
            ws.send(JSON.stringify({
                "message": "Game started"
            }))
        } else if (e.data == 'server:Game ended') {
            ws.send(JSON.stringify({
                "message": "Game ended"
            }))
        }

        await updateSidebar()
	}

	ws.onerror = function(e) {
	}

	ws.onclose = function(e) {
	}

    return ws
}

async function updateSidebar() {
    const friendBtn = document.getElementById("friendBtnNavbar")
    const friendListContainer = document.querySelector("#friendListContainer")
    const friendRequestContainer = document.querySelector("#friendRequestContainer")
    
    if (friendListContainer) {
        const friendListContent = await getFriendList()
        friendListContainer.innerHTML = friendListContent
    }

    if (friendRequestContainer) {
        const friendRequestContent = await getFriendRequests()
        friendRequestContainer.innerHTML = friendRequestContent
    }

    initDeleteEventListeners()
    initFriendRequestsEventListeners()
}

function initFriendRequestsEventListeners() {
	const inputs = document.querySelectorAll(".btn-friend-request")
	if (inputs != undefined) {
		inputs.forEach(input => {
			let name = input.name
			const action = name.split('-')[0]
			const username = name.split('-')[1]
			input.addEventListener("click", async function (e) {
				e.preventDefault()
				let success = false
				if (action == "accept")
					success = await acceptFriendRequest(username)
				else if (action == "decline")
					success = await declineFriendRequest(username)
				if (success)
					updateSidebar()
			})
		})
	}
}

function initDeleteEventListeners() {
	const deleteButtons = document.querySelectorAll(".btn-delete-friend")
	if (deleteButtons != undefined) {
		deleteButtons.forEach(btn => {
			btn.addEventListener("click", async function (e) {
				e.preventDefault()
				const name = btn.name
				const username = name.split('-')[1]
				await deleteFriendship(username)
				updateSidebar()
			})
		})
	}
}

export async function createSidebar() {
    const friendBtn = document.getElementById("friendBtnNavbar")
    const friendCollapse = document.getElementById("friendCollapse")
    const friendList = await getFriendList()
    const friendRequests = await getFriendRequests()
	let friendRequestHtml = ""

	// if (friendRequests.length != 0)
    friendRequestHtml = `
            <hr>
            <h3 class="text-primary fs-3 fw-bold">Requests</h3>
                <ul class="nav nav-pills flex-column mb-auto">
                    <div id="friendRequestContainer">${friendRequests}</div>
                </ul>
    `

    friendBtn.innerHTML = `
	<text id="textFriendBtn"
	class="position-relative"
	data-bs-toggle="collapse"
	data-bs-target="#sidebarCollapse"
	>${getSVG.navbarSVG.friends}
	</text>
		`
	friendCollapse.innerHTML = `
		<div class="container position-absolute top-5 start-70 end-0" style="max-width: 500px; z-index: 1000">
			<div class="collapse" id="sidebarCollapse">	
				<div id="friendSidebar" class="d-flex m-2 p-2 flex-column align-items-stretch flex-shrink-0 text-bg-dark">
					<h3 class="text-primary fs-3 fw-bold">Friends</h3>
						<ul class="nav nav-pills flex-column mb-auto">
							<div id="friendListContainer">${friendList}</div>
					   </ul>
					   ${friendRequestHtml}
				</div>
			</div>
		</div>
    `

    initFriendRequestsEventListeners()
    initDeleteEventListeners()
}

export async function initSidebar() {
    const friendBtn = document.getElementById("friendBtnNavbar")
    const friendCollapse = document.getElementById("friendCollapse")
	if (!await fetcher.isAuthenticated()) {
        if (friendBtn != undefined)
            friendBtn.innerHTML = ""
        friendCollapse.innerHTML = ""
        return
    }

    let ws = connectWebsocket()

    window.addEventListener("click", function (e) {
        if (ws.readyState == ws.OPEN) {
            ws.send(JSON.stringify({
                "message": "online",
            }))
        }
    })
    
    await createSidebar()
}
