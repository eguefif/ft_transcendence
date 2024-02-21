import { fetcher } from "./fetcher.js";

async function getFriendRequests() {
    const res = await fetcher.get("api/get_friend_requests/")
    console.log(res)
}

async function sendFriendRequest() {
    const body = {"username": "scloutie"}
    const res = await fetcher.post("api/send_friend_request/", body)
    console.log(res)
}

function makeFriendElement(username, onlineStatus) {
    return `
        <li class="nav-item" style="margin: 0px;">
            <a href="#" class="nav-link" aria-current="page"> ${username} <span class="badge rounded-pill text-dark bg-light">${onlineStatus}</span></a>
        </li>
    `
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

    sidebar.innerHTML = `
        <div class="collapse collapse-horizontal" id="sidebarCollapse" style="position: absolute; height: 80%;">	
            <div id="friendSidebar" class="d-flex flex-column align-items-stretch flex-shrink-0 text-bg-dark overflow-auto" style="width: 280px; height: 100%">
                <h1>Friends</h1>
                <hr>
                    <ul class="nav nav-pills flex-column mb-auto">
                        ${friendList}
                    </ul>
                <button class="btn btn-primary" type="button" data-bs-toggle="collapse" data-bs-target="#sidebarCollapse">Collapse</button>
            </div>
        </div>
        <button class="btn btn-primary" type="button" data-bs-toggle="collapse" data-bs-target="#sidebarCollapse">Collapse</button>
    `
}