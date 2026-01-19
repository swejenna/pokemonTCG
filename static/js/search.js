import { apiFetch, ApiError } from "./apiClient.js";

async function searchCardWithRetry() {
	const loadingEl = document.getElementById("loading");
	const errorEl = document.getElementById("error");

	let attempt = 0;

	const MAX_RETRIES = 5;
	const RETRY_DELAYS_SECONDS = [5, 10, 15, 30, 60];

	loadingEl.style.display = "block";
	loadingEl.textContent = "Searching for cards...";
	errorEl.style.display = "none";

	while (true) {
		try {
			await searchCard();
			return;
		} catch (error) {
			if (!(error instanceof ApiError) || !error.retryable) { // other exception, let it bubble up
				throw error;
			}

			// start retry
			attempt++;

			if (attempt > MAX_RETRIES) {
				loadingEl.style.display = "none";
				errorEl.textContent =
					"Sorry, they must be really busy right now... try again later I guess :/";
				errorEl.style.display = "block";
				return;
			}

			// seconds for us
			const delaySeconds =
				RETRY_DELAYS_SECONDS[
					Math.min(
						attempt - 1,
						RETRY_DELAYS_SECONDS.length - 1,
					)
				];

			// millis for the next promise delay
			const delay = delaySeconds * 1000;

			// debug
			loadingEl.textContent = `Oopsie! Server-senpei encountered a 5xx error ~nya ~nya -- retry ${attempt} in ${delaySeconds} seconds`;
			loadingEl.style.display = "block";
			console.log(loadingEl.textContent);
			console.log(error);
			console.log(error.type);

			await new Promise((r) => setTimeout(r, delay));
		}
	}
}

async function searchCard() {
	const searchTerm = document
		.getElementById("cardSearch")
		.value.trim();
	const loadingEl = document.getElementById("loading");
	const errorEl = document.getElementById("error");
	const resultsEl = document.getElementById("results");

	// Clear previous results
	errorEl.style.display = "none";
	errorEl.textContent = "";
	resultsEl.innerHTML = "";

	if (!searchTerm) {
		errorEl.textContent = "Please enter a card name";
		errorEl.style.display = "block";
		return;
	}

	loadingEl.style.display = "block";

	try {
		const cards = await apiFetch(
			`/api/sdk/search?name=${encodeURIComponent(searchTerm)}`,
		);

		loadingEl.style.display = "none";

		if (!cards || cards.length === 0) {
			errorEl.textContent = "No cards found";
			errorEl.style.display = "block";
			return;
		}

		// debug: force error to see retries
		// throw { type: "server", status: 500 };

		displayCards(cards);
	} catch (error) {
		loadingEl.style.display = "none";

		// re-throw server errors for the wrapper
		if (error?.type === "server") {
			throw error;
		}

		errorEl.textContent = `Error: ${error.message}`;
		errorEl.style.display = "block";
	}
}

function displayCards(cards) {
	const resultsEl = document.getElementById("results");

	cards.slice(0, 5).forEach((card) => {
		const cardDiv = document.createElement("div");
		cardDiv.className = "card-container";
		cardDiv.innerHTML = cardTemplate(card); // template literal refactored below

		// link to card details page
		cardDiv.style.cursor = "pointer";
		cardDiv.onclick = () => {
			window.location.href = `/card/${card.id}`;
		};

		resultsEl.appendChild(cardDiv);
	});

	if (cards.length > 5) {
		const moreResults = document.createElement("p");
		moreResults.style.textAlign = "center";
		moreResults.style.color = "#666";
		moreResults.textContent = `Showing 5 of ${cards.length} results`;
		resultsEl.appendChild(moreResults);
	}
}

document
	.getElementById("cardSearch")
	.addEventListener("keypress", function (e) {
		if (e.key === "Enter") {
			searchCardWithRetry();
		}
	});

document
	.getElementById("searchBtn")
	.addEventListener("click", searchCardWithRetry);


function cardTemplate(card) {
	const line = (label, value) =>
		value ? `<p><strong>${label}:</strong> ${value}</p>` : "";

	return `
                <div>
                    <img src="${card.images.large}" alt="${card.name}" class="card-image">
                </div>

                <div class="card-details">
                    <h2>${card.name}</h2>
                    <p><strong>Set:</strong> ${card.set.name}</p>
                    <p><strong>Number:</strong> ${card.number}/${card.set.printedTotal}</p>
                    <p><strong>Rarity:</strong> ${card.rarity || "N/A"}</p>
                    ${line("Types", card.types?.join(", "))}
                    ${line("HP", card.hp)}
                    ${line("Artist", card.artist)}
                    ${line("Flavor Text", card.flavorText)}

                    <!-- another way to handle ternaries ^^^
                    ${card.types ? `<p><strong>Types:</strong> ${card.types.join(", ")}</p>` : ""}
                    ${card.hp ? `<p><strong>HP:</strong> ${card.hp}</p>` : ""}
                    ${card.artist ? `<p><strong>Artist:</strong> ${card.artist}</p>` : ""}
                    ${card.flavorText ? `<p><strong>Flavor Text:</strong> ${card.flavorText}</p>` : ""}
                    -->
                    
                </div>
            `;
}
