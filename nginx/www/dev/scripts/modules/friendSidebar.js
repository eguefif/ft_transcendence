import { fetcher } from "./fetcher.js";
import { getSVG } from "./iconSVG.js";

async function deleteFriendship(username) {
    const body = {"username": username}
    const res = await fetcher.post("api/delete_friendship/", body)
}

export async function sendFriendRequest(username) {
    const body = {"username": username}
    const res = await fetcher.post("api/send_friend_request/", body)
    await updateSidebar()
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
                    <div class="nav-link noclick" aria-current="page">${username}</div>
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
        case "Pending":
            colorClasses = "text-bg-light"
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

function makePendingElement(username) {
    return `
        <li class="nav-item" style="margin: 0px;">
            <div class="row align-items-center">
                <div class="col-auto">
                    <div class="nav-link noclick" aria-current="page">${username} ${createStatusBage("Pending")}</div>
                </div>
            </div>
        </li>
    `
}

async function getSentRequests() {
    const res = await fetcher.get("api/get_sent_requests/")

    if (res.status != 200)
        return ""

    let pending_friends = ""
    for (let i = 0; i < res.data.length; i++) {
        let user = res.data[i]
        pending_friends += makePendingElement(user['username'])
    }
    return pending_friends
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
    const res = await fetcher.get("api/get_friend_list/")

    if (!(res.status >= 200 && res.status < 300))
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
        if (ws == undefined)
            return 
        if (ws.readyState == 2 || ws.readyState == 3)
            return 
        try {
            ws.send(JSON.stringify({"message": "Game started"}))
        }
        catch {}
		
	})

	document.addEventListener("endGame", (e) => {
        if (ws == undefined)
            return 
        if (ws.readyState == 2 || ws.readyState == 3)
            return 
        try {
            ws.send(JSON.stringify({"message": "Game ended"}))
        }
        catch {}
		
	})

	const logoutBtn = document.getElementById("logoutButton");
	if (logoutBtn != undefined) {
		logoutBtn.addEventListener("click", (e) => {
   		try {
          if (ws.readyState == ws.OPEN)
			    ws.close()
			}
			catch {}
		})
	}

	ws.onopen = async function(e) {
        if (ws == undefined)
            return 
        if (ws.readyState == 2 || ws.readyState == 3)
            return 
		await fetcher.sendToken(ws)
		try {
            window.addEventListener("click", function (e) {
                if (ws == undefined)
                    return 
                if (ws.readyState == 2 || ws.readyState == 3)
                    return 
                try {
                    ws.send(JSON.stringify({
                        "message": "online",
                    }))
                }
                catch {}
            })

            if (ws == undefined)
                return 
            if (ws.readyState == 2 || ws.readyState == 3)
                return 
        
            ws.send(JSON.stringify({
                "message": "online",
            }))
            
		}
		catch {}
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
            if (ws == undefined)
                return 
            if (ws.readyState == 2 || ws.readyState == 3)
                return 
			try {
				ws.send(JSON.stringify({
					"message": "Game started"
				}))
			}
			catch {}
        } else if (e.data == 'server:Game ended') {
			if (ws == undefined)
                return 
            if (ws.readyState == 2 || ws.readyState == 3)
                return 
            try {
				ws.send(JSON.stringify({
					"message": "Game ended"
				}))
			}
			catch {}
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
    if (await fetcher.isAuthenticated()) {
        const friendListContainer = document.querySelector("#friendListContainer")
        const friendRequestContainer = document.querySelector("#friendRequestContainer")
        
        if (friendListContainer) {
            const friendListContent = await getFriendList()
            friendListContainer.innerHTML = friendListContent
        }

        if (friendRequestContainer) {
            const friendRequestContent = await getFriendRequests()
            const sentRequestsContent = await getSentRequests()
            friendRequestContainer.innerHTML = friendRequestContent + sentRequestsContent
        }

        initDeleteEventListeners()
        initFriendRequestsEventListeners()
    }
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
					await updateSidebar()
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
				await updateSidebar()
			})
		})
	}
}

export async function createSidebar() {
    const friendCollapse = document.getElementById("friendCollapse")
    const friendList = await getFriendList()
    const friendRequests = await getFriendRequests()
    const pendingFriends = await getSentRequests()
	let friendRequestHtml = ""

    friendRequestHtml = `
            <hr>
            <h3 class="text-primary fs-3 fw-bold">Requests</h3>
                <ul class="nav nav-pills flex-column mb-auto">
                    <div id="friendRequestContainer">${friendRequests}${pendingFriends}</div>
                </ul>
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
	const collapse = document.getElementById("sidebarCollapse")
	if (collapse) {
		document.addEventListener("click", () => {
			collapse.classList.remove("show")
		});
	}

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

    connectWebsocket()

    await createSidebar()
}
