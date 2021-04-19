"use strict";

const $form = $("#submit-form")
const $displayMsg = $('<div>')
const $title = $('h2')
const $points = $('<h3>')
const $timer = $('<h3>')
const $start = $('#start-btn')
let total = 0
let repeats = []

// Handle game points
function addPoints(pts) {
    total += pts
    $points.html(`Score: ${total}`)
}

// Handle game feedback message
function displayMessage(msg, pts) {
    // if result is ok: return green response
    if (msg == "ok") {
        let alrtType = "success"
        $displayMsg.html(`You Scored ${pts} points!`)
        addPoints(pts)
    } else if (msg == "not-on-board") {
        let alrtType = "warning"
        $displayMsg.html('Word Not On Board!')
    } else if (msg == "duplicate") {
        let alrtType = "warning"
        $displayMsg.html('Duplicate Word!')
    }
    else {
        let alrtType = "warning"
        $displayMsg.html('Not a Valid Word!')
    }

    let alrtType = 'success'
    $displayMsg.addClass(`alert alert-${alrtType} my-2`).attr('role', 'alert')
    $title.append($displayMsg)
    console.log(pts)
}

// Function to call to flask route given word, sends word to flask route
async function submitWord(word) {
    // AJAX axios POST call to flask route WILL GET data back in {result: msg} form
    if (!isRepeat(word)) {
        repeats.push(word)
        let response = await axios.post("http://127.0.0.1:5000/check_word", {word: word})
        let msg = response.data
        return msg
    }
    else {
        let msg = "duplicate"
        return msg
    }
    
}

// Function to call to flask to update highscore and num_played in backend
async function updateScoreBoard(score, numPlayed = 0) {

    // Update Backend
    let response = await axios.post("http://127.0.0.1:5000/score_board", {
        score: score,
        numPlayed: numPlayed
    })

    // Update UI
    let scoreData = await getScores()
    $('#high-score').html(`HighScore: ${scoreData['highScore']}`)
    $('#num-played').html(`Number of Games Played: ${scoreData['numPlayed']}`)
}

// Get Scores Function
async function getScores() {
    let response = await axios.get("http://127.0.0.1:5000/score_board")
    return response.data
} 

// Timer Function
function timer() {

    $('#submit-input').show()
    $('#submit-btn').show()

    let sec = 60
    const countDown = setInterval(async () =>{
        sec -= 1
        $timer.html(`Time Left: ${sec}`)
        if (sec == 0) {
            clearInterval(countDown)
            let scoreData = await getScores()
            let update = updateScoreBoard(total, scoreData['numPlayed'])
            reset()
        } 
    }, 1000)
}

// Reset Game
function reset() {
    freeze()
    total = 0
    repeats = []
}

// Freeze Game
function freeze(){
    // Remove Event Listener Using unbind
    $(document).unbind()
    $(document).on('submit', '#submit-form', function(evt) {
        evt.preventDefault()
    }) 
}

// Game Start
function gameStart() {

    // initialize form submit function on button
    $(document).on('submit', '#submit-form', async function(evt) {
        evt.preventDefault()
        const $word = $("#word-input").val()
        let message = await submitWord($word)

        displayMessage(message['result'], $word.length)
        $("#word-input").val('')
    }) 

    // set up scoreboard
    $points.html(`Score: ${total}`)
    $points.addClass('mx-5 my-2')
    $form.append($points)

    // set up timer
    $form.append($timer)
    $timer.addClass('mx-5 my-2')
    timer()

}

// Word Repeat Tracker Function
function isRepeat(word) {
    if (repeats.indexOf(word) >= 0) {
        return true
    }
    else {
        return false
    }
    
}


freeze()
$start.on('click', () => {gameStart()})

$(document).on('load', async () => {
    let scoreData = await getScores()
    $('#high-score').html(`HighScore: ${scoreData['highScore']}`)
    $('#num-played').html(`Number of Games Played: ${scoreData['numPlayed']}`)
})

