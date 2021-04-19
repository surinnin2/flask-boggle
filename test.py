from unittest import TestCase
from app import app
from flask import session, jsonify
from boggle import Boggle


class FlaskTests(TestCase):

    def test_homepage(self):
        with app.test_client() as client:
            res = client.get('/')
            html = res.get_data(as_text=True)

            self.assertEqual(res.status_code, 200)
            self.assertIn('<h2 class="title" id="title">Boggle!</h2>', html)
            
    def test_check_word(self):
        with app.test_client() as client:
            with client.session_transaction() as client_session:
                client_session['board'] = [['Q', 'Q', 'Q', 'Q', 'Q'],
                                           ['Q', 'Q', 'Q', 'Q', 'Q'],
                                           ['Q', 'Q', 'Q', 'Q', 'Q'],
                                           ['Q', 'Q', 'Q', 'Q', 'Q'],
                                           ['W', 'O', 'R', 'K', 'S']]

            res = client.post('/check_word', json={'word': 'works'})

            self.assertEqual(res.status_code, 200)
            self.assertEqual(res.json['result'], 'ok')

    def test_score_board(self):
        with app.test_client() as client:
            res = client.get('/score_board')

            self.assertEqual(res.status_code, 200)
            self.assertEqual(res.json['highScore'], 0)
            self.assertEqual(res.json['numPlayed'], 0)