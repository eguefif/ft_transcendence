function createFetcher() {
	// These are durations in ms (to be compared with Date.now())
	const accessDuration = 5 * 60 * 1000;
	const refreshDuration = 3 * 24 * 60 * 60 * 1000;

	const token = (function () {
		let value = "";
		let expires = 0;

		const get = () => {
			return value;
		};

		const set = (key) => {
			value = key;
		};

		const isValid = () => {
			return !(value.length == 0 || expires <= Date.now());
		};

		const reset = () => {
			value = "";
			expires = 0;
		}

		const refresh = async () => {
			if (
				!localStorage.getItem("refreshExpiry") ||
				localStorage.getItem("refreshExpiry") <= Date.now()
			) {
				localStorage.removeItem("refreshExpiry");
				return false;
			}
			try {
				const refreshExpiry = Date.now() + refreshDuration;
				expires = Date.now() + accessDuration;
				const result = await fetch("/api/auth/refresh", {
					method: "POST",
					credentials: "same-origin",
					headers: { "Content-Type": "application/json", Authorization: value },
				});
				const data = await result.json();
				if (result.status == 200) {
					value = data.accessToken;
					localStorage.setItem("refreshExpiry", `${refreshExpiry}`);
					return true;
				} else {
					value = "";
					expires = 0;
					return false;
				}
			} catch {
				value = "";
				expires = 0;
				return false;
			}
		};

		return { get, set, isValid, refresh, reset };
	})();

	const reset = () => {
		token.reset();
	}

	const isAuthenticated = async () => {
		return token.isValid() ? true : await token.refresh();
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
			if (result.status == 401 && redo && (await token.refresh())) {
				return await get(url, false);
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
			if (result.status == 401 && redo && (await token.refresh())) {
				return await post(url, body, false);
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
				websocket.send(JSON.stringify({"token": rettoken}))
				return true
		}
		else {
			return false
		}
	}
	return { accessDuration, refreshDuration, setAccess, isAuthenticated, get, post, sendToken, reset };
}

export const fetcher = createFetcher();
