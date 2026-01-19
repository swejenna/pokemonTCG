import json
import os
import ssl
from flask import jsonify, render_template, request
from requests import RequestException, Timeout
from urllib.error import URLError
from pokemontcgsdk import Card
from pokemontcgsdk import RestClient
from pokemontcgsdk import PokemonTcgException
from dotenv import load_dotenv

#load in enviroment variables
load_dotenv()

POKEMON_API_KEY = os.getenv('POKEMON_API_KEY', '')

RestClient.configure(POKEMON_API_KEY)

# TODO: Reimplement search_cards() and get_card() from app.py using Pokemon TCG Python SDK (https://github.com/PokemonTCG/pokemon-tcg-sdk-python)
#
# https://docs.pokemontcg.io/getting-started/errors for exception handling
#
# On API slowness: https://discordapp.com/channels/222559292497068043/806542736777674812/1399774009620566099 
def parse_sdk_error(e):
    raw = getattr(e, "description", e)

    if isinstance(raw, bytes):
        raw = raw.decode("utf-8", errors="replace")

    try:
        return json.loads(raw)
    except Exception:
        return raw



def register_error_handlers(app):
    @app.errorhandler(PokemonTcgException)
    def handle_pokemon_sdk_error(e):
        error_payload = parse_sdk_error(e)
        return jsonify({"error": error_payload}), 500

    # started getting ssl certificate verification failures from api.pokemontcg.io
    @app.errorhandler(URLError)
    def handle_url_error(e):
        reason = getattr(e, "reason", e)

        if isinstance(reason, ssl.SSLError):
            return jsonify({
                "error": "Upstream SSL verification failed",
                "details": str(reason)
            }), 502

        return jsonify({
            "error": "Upstream network error",
            "details": str(reason)
        }), 502


    @app.errorhandler(RequestException)
    def handle_requests_error(e):
        return jsonify({'error': str(e)}), 500
    
    @app.errorhandler(Timeout)
    def handle_timeout(e):
        return jsonify({
            "error": "Upstream request timed out"
        }), 504



def routes(app):
    register_error_handlers(app)

    @app.route('/api/sdk/search', methods=['GET'])
    def sdk_search_cards():
        card_name = request.args.get('name', '')

        if not card_name:
            return jsonify({'error': 'Card name is required'}), 400

        
        # cards = Card.where(q=f'name:{card_name}')
        # return cards

        cards = Card.where(q=f'name:{card_name}')
        card_list = list(cards)

        return jsonify(card_list)


    @app.route('/api/sdk/card/<card_id>', methods=['GET'])
    def sdk_get_card(card_id):
        card = Card.find(f'{card_id}')

        return jsonify(card)
    
    @app.route("/card/<card_id>")
    def card_page(card_id):
        return render_template("card_dump.html", card_id=card_id)
