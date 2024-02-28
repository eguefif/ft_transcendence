import { fetcher } from "./fetcher.js";

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
                    <a href="#" class="nav-link" aria-current="page">${username}</a>
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
                    <a href="#" class="nav-link" aria-current="page">${username} ${createStatusBage(onlineStatus)}</a>
                </div>
                <div class="col">
                    <a name="delete-${username}" class="btn btn-sm btn-danger btn-delete-friend">Delet</a>
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
    let ws = new WebSocket("wss://localhost/online_status/")

	ws.onopen = async function(e) {
		console.log('Connection established')
		await fetcher.sendToken(ws)
	}

	ws.onmessage = async function(e) {
		console.log(e.data)

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
		console.log("Error")
	}

	ws.onclose = function(e) {
		console.log("Connection closed")
	}

    return ws
}

async function updateSidebar() {
    const friendBtn = document.querySelector("#addFriendList")
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

    initDeleteEventListeners(friendBtn)
    initFriendRequestsEventListeners(friendBtn)
}

function initFriendRequestsEventListeners(friendBtn) {
    const inputs = friendBtn.querySelectorAll(".btn-friend-request")
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

function initDeleteEventListeners(friendBtn) {
    const deleteButtons = friendBtn.querySelectorAll(".btn-delete-friend")
    deleteButtons.forEach(btn => {
        btn.addEventListener("click", async function (e) {
            const name = btn.name
            const username = name.split('-')[1]
            e.preventDefault()
            console.log("Delete " + username)
            await deleteFriendship(username)
            updateSidebar()
        })
    })
}

export async function createSidebar() {
    const friendBtn = document.querySelector("#addFriendList")
    const friendList = await getFriendList()
    const friendRequests = await getFriendRequests()

    friendBtn.innerHTML = `
        <div class="collapse collapse-horizontal" id="sidebarCollapse" style="position: absolute; height: 80%;">	
            <div id="friendSidebar" class="d-flex flex-column align-items-stretch flex-shrink-0 text-bg-dark overflow-auto" style="width: 350px; height: 100%">
                <h1>Friends</h1>
                <hr>
                    <ul class="nav nav-pills flex-column mb-auto">
                        <div id="friendListContainer">${friendList}</div>
                        <h1>Requests</h1>
                        <hr>
                        <div id="friendRequestContainer">${friendRequests}</div>
                    </ul>
                <button class="btn btn-primary" type="button" data-bs-toggle="collapse" data-bs-target="#sidebarCollapse">Collapse</button>
            </div>
        </div>
        <button class="btn btn-primary" type="button" data-bs-toggle="collapse" data-bs-target="#sidebarCollapse">
            Friends
        </button>
        <form id="formFriendRequest">
            <label for="sendFriendRequest">username</label>
            <input type="text" name="username" class="form-control" type="button" id="sendFriendRequest"></input>
            <button type="submit" class="btn btn-primary">Submit</button>
        </form>
    `

    const formFriendRequest = document.getElementById("formFriendRequest")
    formFriendRequest.addEventListener("submit", async function (e) {
        e.preventDefault()
        const data = new FormData(e.target)
        const res = await sendFriendRequest(data.get('username'))
    })

    initFriendRequestsEventListeners(friendBtn)
    initDeleteEventListeners(friendBtn)
}

export async function initSidebar() {
    if (!await fetcher.isAuthenticated())
        return

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
