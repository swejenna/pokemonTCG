# Pokémon TCG Card Search

A web application that allows users to search for Pokémon Trading Card Game cards by name and view detailed card information.

## Features

- Search Pokémon cards by name
- Display card images and details
- View card statistics (HP, attacks, abilities, etc.)
- Responsive design for mobile and desktop

## Tech Stack

**Backend:**
- Python 
- Flask
- PokémonTCG API

**Frontend:**
- HTML
- CSS
- JavaScript

## Installation

1. Clone the repository:
```bash
git clone https://github.com/swejenna/pokemonTCG.git
cd pokemonTCG
```

2. Create a virtual environment and activate it:
```bash
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Set up environment variables:
```bash
# Create .env file and add your PokémonTCG API key as POKEMON_API_KEY="YOUR_API_KEY_HERE", where your api key is inserted as a string type.
```

5. Run the application:
```bash
python app.py
```

6. Open your browser and navigate to `[(http://127.0.0.1:5000)]`

7. Test endpoints (if you are nosey enough):
   Search: curl "http://127.0.0.1:5000/api/search?name=Pikachu"
   Card: curl "http://127.0.0.1:5000/api/card/<card_id>", where card_id is inserted as an integer (non string) type.

## Usage

1. Enter a Pokémon name in the search bar
2. Click "Search" to retrieve all cards for that Pokémon
3. Browse through the results to view card details (limited to 5 results to protect api usage)

## API

This project uses the [PokémonTCG API](https://pokemontcg.io/) to fetch card data.

## Project Structure
```
pokemonTCG/
├── app.py              # Flask backend
├── requirements.txt    # Python dependencies
├── static/            # CSS and JavaScript files
├── templates/         # HTML templates
└── .gitignore
```

## Future Enhancements

- Search by card title & card number search feature
- Add to portfolio feature
- Favorite cards list feature
- Extensive Sorting & Filtering

## License

[None]

## Contact

[Jenna Hall] - [jhal990@wgu.edu]
```
