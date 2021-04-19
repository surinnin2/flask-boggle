from boggle import Boggle
from flask import Flask, request, session, flash, render_template, jsonify
from flask_debugtoolbar import DebugToolbarExtension

app = Flask(__name__)
app.config['SECRET_KEY'] = "passkey"

debug = DebugToolbarExtension(app)

boggle_game = Boggle()

@app.route('/')
def homepage():
    """Homepage Route: sets up the board and saves it in session"""

    session['board'] = Boggle.make_board(boggle_game)
    board = session.get('board')

    return render_template('homepage.html', board=board)

@app.route('/check_word', methods=["POST"])
def check_word():
    """POST request Route for AJAX axios call for board and word"""
    
    board = session.get('board')
    res = request.get_json()
    print(res)
    word = res['word']
    print(word)
    board = session.get('board')
    msg = Boggle.check_valid_word(boggle_game, board, word)


    return jsonify({"result": msg})

@app.route('/score_board', methods=["GET", "POST"])
def score_board():
    """POST or GET request Route for AJAX axios call for scoreboard"""

    if request.method == "POST":
        data = request.get_json()
        score = data['score']
        session['numPlayed'] = data['numPlayed'] + 1
        num_played = session['numPlayed']

        if score > session.get('highscore', 0):
            session['highscore'] = score
        
        return jsonify({"highScore": session['highscore'], "numPlayed": num_played})
    else:
        high_score = session.get('highscore', 0)
        num_played = session.get('numPlayed', 0)

        return jsonify({"highScore": high_score, "numPlayed": num_played})