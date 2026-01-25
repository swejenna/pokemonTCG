export class ApiError extends Error {
	constructor(message, { status, retryable }) {
		super(message);
		this.name = "ApiError";
		this.status = status;
		this.retryable = retryable;
	}
}

export async function apiFetch(url) {
	let response;

	try {
		response = await fetch(url);
	} catch {
		throw new ApiError("Network error", {
			status: null,
			retryable: true,
		});
	}

	if (!response.ok) {
		throw new ApiError("HTTP error", {
			status: response.status,
			retryable: response.status >= 500,
		});
	}

	return response.json();
}
