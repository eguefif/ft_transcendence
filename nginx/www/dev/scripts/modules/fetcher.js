function createFetcher() {
	// These are durations in ms (to be compared with Date.now())
	const accessDuration = 5 * 60 * 1000;
	const refreshDuration = 3 * 24 * 60 * 60 * 1000;

	const token = (function (){
		let value = ""; 
		let expires = 0;

		const get = () => {
			return value 
		}
		
		const set = (key) => {
			value = key;
		}

		const isValid = () => {
			return !(value.length == 0 || expires <= Date.now());
		}

		const refresh = async () => {
			if (!localStorage.getItem("refreshExpiry")
				|| localStorage.getItem("refreshExpiry") <= Date.now()) {
				localStorage.removeItem("refreshExpiry");
				return false;
			}
			try {
				const refreshExpiry = Date.now() + refreshDuration;
				expires = Date.now() + accessDuration;
				const result = await fetch("/api/auth/refresh", {
					method: "POST",
					credentials: "same-origin",
					headers: {"Content-Type": "application/json",
						"Authorization": value}
				})
				const data = await result.json();
				if (result.status == 200) {
					value = data.accessToken;
					localStorage.setItem("refreshExpiry", `${refreshExpiry}`);
					return true;
				}
				else {
					value = ""; 
					expires = 0;
					return false;
				}
			}
			catch (error) {
				value = "";
				expires = 0;
				return false;
			}
		}

		return { get, set, isValid, refresh }
	})();

	const isAuthenticated = async () => {
		return (token.isValid() ? true : await token.refresh());
	}
	
	const setAccess = (key) => {
		token.set(key);
	}

	const get = async (url, redo = true) => {
		try {
			const result = await fetch(url, {
				method: "GET",
				credentials: "same-origin",
				headers: {"Content-Type": "application/json",
					"Authorization": token.get()}
			})
			if (result.status == 401 && redo && await token.refresh()) {
				return (await get(url, false));
			}
			let data;
			try {
				data = await result.json();
			}
			catch {
				data = {};
			}
			return {"status": result.status, "data": data};
		}
		catch {
			return {"status": 418, "data": {"info": "fetch failed"}};
		}
	}

	const post = async (url, body, redo = true) => {
		const bodyJSON = JSON.stringify(body);
		try {
			const result = await fetch(url, {
				method: "POST",
				headers: {"Content-Type": "application/json",
					"Authorization": token.get()},
				body: bodyJSON
			})
			if (result.status == 401 && redo && await token.refresh()) {
				return (await post(url, false));
			}
			let data;
			try {
				data = await result.json();
			}
			catch {
				data = {};
			}
			return {"status": result.status, "data": data};
		}
		catch {
			return {"status": 448, "data": {"info": "fetch failed"}};
		}
	}
	return { accessDuration, refreshDuration, setAccess, isAuthenticated, get, post };
}

export const fetcher = createFetcher();
