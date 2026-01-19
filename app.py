from flask import Flask, jsonify, render_template, request
import requests
import os
from dotenv import load_dotenv


#load in enviroment variables
load_dotenv()

app = Flask(__name__)


# get api key from env
POKEMON_API_KEY = os.getenv('POKEMON_API_KEY', '')
POKEMON_API_BASE = 'https://api.pokemontcg.io/v2'


#headers with auth
HEADERS = {
    "Accept": "application/json",
    'X-Api-Key': POKEMON_API_KEY
}


# other routes: /api/sdk/{search, card/<card_id>}
from api.routes import routes
routes(app)

# your routes
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/search', methods=['GET'])
def search_cards():
    card_name = request.args.get('name', '')

    if not card_name:
        return jsonify({'error': 'Card name is required'}), 400
    
    try:
        response = requests.get(
            f'{POKEMON_API_BASE}/cards',
            headers=HEADERS,
            params={'q':f'name:{card_name}'}
        )
        response.raise_for_status()
        return jsonify(response.json())
    
    except requests.exceptions.RequestException as e:
        return jsonify({'error': str(e)}), 500
    
@app.route('/api/card/<card_id>', methods=['GET'])
def get_card(card_id):
    try:
        response = requests.get(
            f'{POKEMON_API_BASE}/cards/{card_id}',
            headers=HEADERS
        )
        response.raise_for_status()
        return jsonify(response.json())
    
    except requests.exceptions.RequestException as e:
        return jsonify({'error': str(e)}), 500
    
if __name__ == '__main__':
    app.run(debug=True)