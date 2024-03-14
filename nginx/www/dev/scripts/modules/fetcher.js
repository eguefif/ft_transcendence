import * as bootstrap from "../bootstrap/bootstrap.bundle.min.js";
import { createAlert, sleep } from "./utils.js"
import { refreshContent } from "./refreshContent.js"

function createFetcher() {
	// These are durations in ms (to be compared with Date.now())
	const accessDuration = 5 * 60 * 1000;
	const refreshDuration = 3 * 24 * 60 * 60 * 1000;

	const token = (function () {
		let value = "";
		let expires = 0;
		let refreshing = false;

		const get = () => {
			return value;
		};

		const set = (key) => {
			value = key;
			expires = Date.now() + accessDuration;
		};

		const isValid = () => {
			return !(value.length == 0 || expires <= Date.now());
		};

		const reset = () => {
			value = "";
			expires = 0;
		}

		const refresh = async () => {
			let maxHang = 0;
			while (refreshing) {
				await sleep(10);
				maxHang += 10;
				if (maxHang >= 5000) {
					return false
				}
			}
			refreshing = true;
			if (
				!localStorage.getItem("refreshExpiry") ||
				localStorage.getItem("refreshExpiry") <= Date.now()
			) {
				localStorage.removeItem("refreshExpiry");
				value = "";
				expires = 0;
				refreshing = false;
				return false;
			}
			try {
				const refreshExpiry = Date.now() + refreshDuration;
				let newExpiry = Date.now() + accessDuration;
				const result = await fetch("/api/auth/refresh", {
					method: "POST",
					credentials: "same-origin",
					headers: { "Content-Type": "application/json", Authorization: value },
				});
				if (result.status >= 200 && result.status < 300) {
					const data = await result.json();
					value = data.accessToken;
					localStorage.setItem("refreshExpiry", `${refreshExpiry}`);
					expires = newExpiry;
					refreshing = false;
					return true;
				} else {
					value = "";
					expires = 0;
					localStorage.removeItem("refreshExpiry");
					refreshing = false;
					return false;
				}
			} catch {
				value = "";
				expires = 0;
				refreshing = false;
				return false;
			}
		};

		return { get, set, isValid, refresh, reset };
	})();

	const reset = () => {
		token.reset();
	}

	const isTryingOauth = async () => {
		const refreshExpiry = Date.now() + fetcher.refreshDuration;
		if (!localStorage.getItem("oauth-42")) {
			return false
		}
		const result = await post("/api/auth/oauth")
		let alert;
		if (result.status >= 200 && result.status < 300) {
			if (result.data.oauth_status) {
				if (result.data.oauth_status.includes("email")) {
					alert = createAlert("warning", "This is an existing account that was linked with your 42 email. It has been updated to use authentication with 42, which will now be required to login.")
					document.querySelector("#alert-container").appendChild(alert);
				}
				else if (result.data.oauth_status.includes("username")) {
					alert = createAlert("warning", "The username associated with your 42 account was already in use on this site. An available username was assigned to your account.");
					document.querySelector("#alert-container").appendChild(alert);
				}
				else {
					alert = createAlert("success", "Successfully authenticated with 42.");
					document.querySelector("#alert-container").appendChild(alert);
					setTimeout(() => {
						const bsAlert = new bootstrap.Alert(alert);
						bsAlert.close()
					}, 3000);
				}
			}
			token.set(result.data.accessToken);
			localStorage.setItem("refreshExpiry", `${refreshExpiry}`)
			localStorage.removeItem("oauth-42")
			return true;
		}
		else if (result.status >= 401 && result.status < 500) {
			alert = createAlert("danger", "Could not authenticate using 42.");
			document.querySelector("#alert-container").appendChild(alert);
			setTimeout(() => {
				const bsAlert = new bootstrap.Alert(alert);
				bsAlert.close()
			}, 3000);
		}
		localStorage.removeItem("oauth-42")
		return false;
	}

	const isAuthenticated = async () => {
		if (token.isValid())
			return true;
		let retval = await token.refresh();
		return retval;
	};

	const setAccess = (key) => {
		token.set(key);
	};

	const get = async (url, redo = true) => {
		const header = {"Content-Type": "application/json", Authorization: token.get()};
		try {
			const result = await fetch(url, {
				method: "GET",
				credentials: "same-origin",
				headers: header,
			});
			if (result.status == 401) {
				if (redo && await token.refresh()) {
					return await get(url, false);
				}
				else
					await refreshContent()
			}
			return await extractData(result);
		} catch {
			return { status: 418, data: { info: "fetch failed" }, type: undefined };
		}
	};

	const post = async (url, body = {}, redo = true) => {
		let bodyJSON;
		let header = {"Content-Type": "application/json", Authorization: token.get()};
		if (body instanceof FormData) {
			delete header["Content-Type"];
			bodyJSON = body
		} else {
			bodyJSON = JSON.stringify(body);
		}
		try {
			const result = await fetch(url, {
				method: "POST",
				headers: header,
				body: bodyJSON,
			});
			if (result.status == 401) {
				if (redo && await token.refresh()) {
					return await post(url, body, false);
				}
				else
					await refreshContent()
			}
			return await extractData(result);
		} catch {
			return { status: 418, data: { info: "fetch failed" } };
		}
	};

	async function extractData(result) {
		let type = result.headers.get("content-type");
		if (!type) {
			type = undefined;
		}
		let data;
		try {
			if (type.startsWith("application")) {
				data = await result.json();
			} else if (type.startsWith("image")) {
				data = await result.blob();
			} else {
				data = undefined;
			}
		} catch {
			data = undefined;
		}
		return { status: result.status, data: data, type: type };
	}

	const sendToken = async (websocket) => {
		if (await token.refresh()) {
			let rettoken = token.get()
				try {
					websocket.send(JSON.stringify({"token": rettoken}))
					return true
				}
				catch {
					return false
				}
		}
		else {
			return false
		}
	}
	return { accessDuration, refreshDuration, setAccess, isTryingOauth, isAuthenticated, get, post, sendToken, reset };
}

export const fetcher = createFetcher();
