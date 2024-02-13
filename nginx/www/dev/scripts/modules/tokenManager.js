export function accessToken() {
	let token = undefined; 

	const refresh = async () => {
		try {
			const result = await fetch("/api/auth/refresh", {
				method: "POST",
				credentials: "same-origin",
				headers: {"Content-Type": "application/json",
					"Authorization": "Token " + token}
			})
			const data = await result.json();
			if (result.status == 200) {
				token = data.accessToken;
				return true;
			}
			else {
				token = undefined; 
				return false;
			}
		}
		catch (error) {
			return false;
		}
	}

	const get = () => {
		return token
	}

	return { refresh, get }
}
