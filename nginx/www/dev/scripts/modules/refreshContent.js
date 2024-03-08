import { createButton } from "./buttonNav.js"
import { pongMenu } from "./pong.js"
import { initSidebar } from "./friendSidebar.js"

export async function refreshContent() {
	await pongMenu()
	await createButton()
	await initSidebar()
}
