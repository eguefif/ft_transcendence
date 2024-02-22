import { fetcher } from "./fetcher.js";

async function deleteFriendship(username) {
    const body = {"username": username}
    const res = await fetcher.post("api/delete_friendship/", body)
}

async function sendFriendRequest(username) {
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

function makeFriendElement(username, onlineStatus) {
    return `
        <li class="nav-item" style="margin: 0px;">
            <div class="row align-items-center">
                <div class="col-auto">
                    <a href="#" class="nav-link" aria-current="page">${username} <span class="badge rounded-pill text-dark bg-light">${onlineStatus}</span></a>
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

export async function initSidebar() {
    if (!await fetcher.isAuthenticated())
        return

    const sidebar = document.querySelector("#sidebarContainer")

    let friendList = await getFriendList()
    let friendRequests = await getFriendRequests()

    sidebar.innerHTML = `
        <div class="collapse collapse-horizontal" id="sidebarCollapse" style="position: absolute; height: 80%;">	
            <div id="friendSidebar" class="d-flex flex-column align-items-stretch flex-shrink-0 text-bg-dark overflow-auto" style="width: 280px; height: 100%">
                <h1>Friends</h1>
                <hr>
                    <ul class="nav nav-pills flex-column mb-auto">
                        ${friendList}
                        <h1>Requests</h1>
                        <hr>
                        ${friendRequests}
                    </ul>
                <button class="btn btn-primary" type="button" data-bs-toggle="collapse" data-bs-target="#sidebarCollapse">Collapse</button>
            </div>
        </div>
        <button class="btn btn-primary" type="button" data-bs-toggle="collapse" data-bs-target="#sidebarCollapse">Friends</button>
        
        <form id="formFriendRequest">
            <label for="sendFriendRequest">username</label>
            <input type="text" name="username" class="form-control" type="button" id="sendFriendRequest"></input>
            <button type="submit" class="btn btn-primary">Submit</button>
        </form>
    `

    // DELETE THIS after testing
    const formFriendRequest = document.getElementById("formFriendRequest")
    formFriendRequest.addEventListener("submit", async function (e) {
        e.preventDefault()
        const data = new FormData(e.target)
        const res = await sendFriendRequest(data.get('username'))
    })

    // initFriendRequestsEventListeners()
    const inputs = sidebar.querySelectorAll(".btn-friend-request")
    inputs.forEach(input => {
        let name = input.name
        const action = name.split('-')[0]
        const username = name.split('-')[1]
        input.addEventListener("click", async function (e) {
            e.preventDefault()
            console.log(action + " " + username)
            let success = false
            if (action == "accept")
                success = await acceptFriendRequest(username)
            else if (action == "decline")
                success = await declineFriendRequest(username)
            if (success)
                initSidebar()
        })
    })

    // initDeleteEventListeners()
    const deleteButtons = sidebar.querySelectorAll(".btn-delete-friend")
    deleteButtons.forEach(btn => {
        btn.addEventListener("click", async function (e) {
            const name = btn.name
            const username = name.split('-')[1]
            e.preventDefault()
            console.log("Delete " + username)
            await deleteFriendship(username)
            initSidebar()
        })
    })
}