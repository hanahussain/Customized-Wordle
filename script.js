const size = 5;

let eol = false;

const state = {
    secret: '',
    grid: Array(6).fill().map(() => Array(size).fill('')), //2D array of game data
    currentRow: 0, //row where next letter will be typed
    currentCol: 0, //col where next letter will be typed
};

// Set to store correctly guessed letters on the keyboard
const correctKeyboardLetters = new Set();

/*document.getElementById('keyboard').addEventListener('click', function(event) {
    if (event.target && event.target.classList.contains('key')) {
      const letter = event.target.textContent;
      if (isLetter(letter)) {
        addLetter(letter);
        event.target.classList.add('guessed');
        updateGrid();
      }
    }
});*/

function updateKeyboard() {
    const guessedLetters = state.grid[state.currentRow];
    const secretLetters = state.secret.split('');

    // Clear guessed letter classes
    const keys = document.querySelectorAll('.key');
    keys.forEach(key => {
        const letter = key.textContent.toLowerCase();
        if (guessedLetters.includes(letter)) {
            if (!key.classList.contains('right') && !correctKeyboardLetters.has(letter)) {
                key.classList.remove('guessed', 'wrong', 'empty');
            }
        }
    });

    // Track correctly guessed letters and their positions
    const correctLetters = new Set();
    guessedLetters.forEach((letter, index) => {
        if (secretLetters[index] === letter) {
            correctLetters.add(letter);
            correctKeyboardLetters.add(letter);
        }
    });

    // Update guessed letter classes based on the current state of the game
    guessedLetters.forEach((letter, index) => {
        const button = document.getElementById(`key${letter.toUpperCase()}`);
        if (button) {
            const correctPosition = secretLetters[index] === letter;
            const inSecretWord = secretLetters.includes(letter);
            if (correctPosition || correctKeyboardLetters.has(letter)) {
                button.classList.add('right');
            } else if (inSecretWord && correctLetters.has(letter)) {
                button.classList.add('right');
            } else if (inSecretWord) {
                button.classList.add('wrong');
            } else {
                button.classList.add('empty');
            }
        }
    });
}

function updateGrid() {
    for(let i = 0; i < state.grid.length; i++) {
        for(let j = 0; j < state.grid[i].length; j++) {
            const box = document.getElementById(`box${i}${j}`);
            box.textContent = state.grid[i][j];
        }
    }
}

function drawBox(container, row, col, letter ='') {
    const box = document.createElement('div');
    box.className = 'box';
    box.id = `box${row}${col}`;
    box.textContent = letter;

    container.appendChild(box);
    return box;
}

function drawGrid(container) {
    const grid = document.createElement('div');
    grid.className = 'grid';

    for(let i = 0; i < 6; i++) {
        for(let j = 0; j < size; j++) {
            drawBox(grid, i, j);
        }
    }

    container.appendChild(grid);
}

function registerKeyboardEvents() {
    document.body.onkeydown = (e) => { //event listener when key pressed
        const key = e.key; //event object e
        if(key === 'Enter') {
            if(state.currentCol === size) {
                const word = getCurrentWord();
                if(isWordValid(word)) {
                    revealWord(word);
                    state.currentRow++;
                    state.currentCol = 0;
                } else {
                    alert('Not a valid word.');
                }
            }
        }
        if(key === 'Backspace') {
            removeLetter();
        }
        if(isLetter(key)) {
            addLetter(key);
        }

        updateGrid();
    }
}
/*
// Function to handle button clicks
function handleButtonClick(event) {
    event.stopPropagation(); // Stop event propagation
    const key = event.target.textContent; // Extract the letter from the button text content
    if (key === 'Enter') {
        if (state.currentCol === size) {
            const word = getCurrentWord();
            if (isWordValid(word)) {
                revealWord(word);
                state.currentRow++;
                state.currentCol = 0;
            } else {
                alert('Not a valid word.');
            }
        }
    } else if (key === 'Backspace') {
        removeLetter();
    } else if (isLetter(key)) {
        addLetter(key);
    }

    updateGrid();
}

// Add event listeners for button clicks
const buttons = document.querySelectorAll('.key');
buttons.forEach(button => {
    button.addEventListener('click', handleButtonClick);
});
*/

function getCurrentWord() {
    return state.grid[state.currentRow].reduce((prev, curr) => prev + curr);
}

function setSecret(secretWords) {
    const randomIndex = Math.floor(Math.random() * secretWords.length);
    state.secret = secretWords[randomIndex].trim();
}


function isWordValid(word) {
    const lc = word.toLowerCase();
    return dictionary.includes(lc);
}

function resetGame() {
    state.secret = '';
    state.grid = Array(6).fill().map(() => Array(size).fill(''));
    state.currentRow = 0;
    state.currentCol = 0;
    correctKeyboardLetters.clear();

    // Clear grid UI
    const game = document.getElementById('game');
    game.innerHTML = ''; // Remove all child elements of the game container
    game.style.marginTop = '-75px'; 
    game.style.marginBottom = '-54px';

    // Clear keyboard UI
    const keys = document.querySelectorAll('.key');
    keys.forEach(key => {
        key.classList.remove('guessed', 'right', 'wrong', 'empty');
    });

    // Start a new game
    startup();
}

function countOccurrences(word, letter) {
    let count = 0;
    for (let i = 0; i < word.length; i++) {
        if (word[i] === letter) {
            count++;
        }
    }
    return count;
}

function countSetOccurrences(letterToFind, correctLetters) {
    let count = 0;
    
    for (const letter of correctLetters) {
        if (letter === letterToFind) {
            count++;
        }
    }
    
    return count;
}


function revealWord(guess) {
    const row = state.currentRow;
    const animation_duration = 500; //ms
    const secretLetters = state.secret.split('');
    const guessedLetters = state.grid[row];
    const correctLetters = []; // Track correctly guessed letters
    const wrongLetters = []; // Track incorrectly guessed letters
    const potentialWrong = new Set(); // Track letters that will either be empty or wrong
    const colors = ['empty', 'empty', 'empty', 'empty', 'empty'];

    for (let i = 0; i < size; i++) {
        const guessedLetter = guessedLetters[i];
        const secretLetter = secretLetters[i];
    
        if (guessedLetter === secretLetter) {
            colors.splice(i, 1,'right');
            correctLetters.push(guessedLetter);
        } else {
            if (secretLetters.indexOf(guessedLetter) !== -1 && !wrongLetters.includes(guessedLetter)) {
                potentialWrong.add(i);
            } else {
                colors.splice(i, 1, 'empty');
            }
        }

        if(i == size-1) {
            for (let j of potentialWrong) {
                if (j !== undefined) {
                    /*console.log(j);
                    console.log("potential: " + [...potentialWrong]);
                    console.log("correctLetters: " + [...correctLetters]);
                    console.log("wrong: " + [...wrongLetters]);*/
                    const numCorrect = countSetOccurrences(guess[j], correctLetters);
                    const numWrong = countSetOccurrences(guess[j], wrongLetters);
                    /*console.log("numCorrect: " + numCorrect);
                    console.log("numWrong: " + numWrong);*/
                    let total = numCorrect + numWrong;
                    const numInSecret = countOccurrences(state.secret, guess[j]);
                    /*console.log("letter: " + guess[j]);
                    console.log("numinsecret: " + numInSecret);
                    console.log(total);*/
                    if (total == 0 && numInSecret > 0) {
                        colors.splice(j, 1, 'wrong');
                        wrongLetters.push(guess[j]);
                    } else if (total >= numInSecret) {
                        colors.splice(j, 1, 'empty');
                    } else {
                        colors.splice(j, 1, 'wrong');
                        wrongLetters.push(guess[j]);
                    }
                } else {
                    console.error("Index 'j' is undefined");
                }
            }
        }
    }

    // Add animation settings outside the loop
    for (let i = 0; i < size; i++) {
            //console.log("COLOR[" + i + "]:  " + colors[i]);
            const box = document.getElementById(`box${row}${i}`);
            setTimeout(() => {
                if(colors[i] === 'right') {
                    box.classList.add('right');
                } else if(colors[i] === 'wrong') {
                    box.classList.add('wrong');
                } else {
                    box.classList.add('empty');
                }
            }, ((i + 1) * animation_duration) / 2);
            box.classList.add('animated');
            box.style.animationDelay = `${(i * animation_duration) / 2}ms`;
        }

    // Update keyboard after revealing the word
    updateKeyboard();
    

    const isWinner = state.secret === guess;
    const isGameOver = state.currentRow === size;
/*
    setTimeout(() => {
        if (isWinner) {
            alert('Splendid!');
            const data = JSON.parse(sessionStorage.getItem('guessFrequency')) || [0, 0, 0, 0, 0, 0];
            data[state.currentRow-1]++;
            sessionStorage.setItem('guessFrequency', JSON.stringify(data));
            //alertWithStats('Splendid!');
            window.location.reload();
        } else if (isGameOver) {
            alert(`Better luck next time... the word was ${state.secret}`);
            window.location.reload();
        }
    }, 3 * animation_duration);
} */

    setTimeout(() => {
        if (isWinner) {
            alert('Splendid!');
            const data = JSON.parse(sessionStorage.getItem('guessFrequency')) || [0, 0, 0, 0, 0, 0];
            data[state.currentRow-1]++;
            sessionStorage.setItem('guessFrequency', JSON.stringify(data));
            markWordAsUsed(state.secret); // Mark the secret word as used
            window.location.reload();
            if(eol) {
                alert('End of word list');
            }
        } else if (isGameOver) {
            alert(`Better luck next time... the word was ${state.secret}`);
            markWordAsUsed(state.secret); // Mark the secret word as used
            window.location.reload();
            if(eol) {
                alert('End of word list');
            }
        }
    }, 3 * animation_duration);
}

function isWordUsed(word) {
    const usedWords = JSON.parse(sessionStorage.getItem('usedWords')) || [];
    return usedWords.includes(word);
}

function markWordAsUsed(word) {
    let usedWords = JSON.parse(sessionStorage.getItem('usedWords')) || [];
    usedWords.push(word);
    sessionStorage.setItem('usedWords', JSON.stringify(usedWords));
}

function isLetter(key) {
    return key.length === 1 && key.match(/[a-z0-9:]/i);
}

function addLetter(letter) {
    if(state.currentCol === size) return;
    state.grid[state.currentRow][state.currentCol] = letter;
    state.currentCol++;
}

function removeLetter() {
    if(state.currentCol === 0) return;
    state.grid[state.currentRow][state.currentCol - 1] = '';
    state.currentCol--;
}

// JavaScript for handling the stats button click and generating the graph
document.getElementById('statsButton').addEventListener('click', () => {
    // Retrieve data from session storage
    const data = JSON.parse(sessionStorage.getItem('guessFrequency')) || [0, 0, 0, 0, 0, 0];
  
    // Display the popup container with darkened background
    const popupContainer = document.getElementById('popupContainer');
    popupContainer.style.display = 'flex'; // Change display property to flex
    setTimeout(() => {
        popupContainer.style.opacity = 1; // Fade in the popup after a short delay
    }, 10);
   
  
    // Generate the graph
    generateGraph(data);
});

document.getElementById('closeButton').addEventListener('click', () => {
    const popupContainer = document.getElementById('popupContainer');
    popupContainer.style.opacity = 0; // Fade out the popup
    setTimeout(() => {
        popupContainer.style.display = 'none'; // Hide the popup after fading out
    }, 300); // Adjust the duration of the fade-out transition
});


  
  function generateGraph(data) {
    const canvas = document.getElementById('graphCanvas');
    const ctx = canvas.getContext('2d');

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Set up graph parameters
    const graphWidth = canvas.width - 30; // Leave some space for margins
    const graphHeight = canvas.height - 40;
    const barWidth = graphWidth / data.length;
    const maxValue = Math.max(...data);

    // Draw bars and labels
    ctx.font = '12px Arial';
    for (let i = 0; i < data.length; i++) {
        const barHeight = (data[i] / maxValue) * graphHeight;
        const x = i * barWidth + 20 + barWidth / 2; // Add margin and half of the bar width
        const y = graphHeight - barHeight + 20; // Add margin

        // Draw bar
        ctx.fillStyle = '#ff6347'; // Set the bar color
        ctx.fillRect(x - barWidth / 2, y, barWidth - 5, barHeight); // Adjust x position

        // Draw y-axis label on top of the bar
        ctx.fillStyle = 'black';
        ctx.textAlign = 'center';
        ctx.fillText(data[i].toFixed(2), x, y - 10); // Adjust x position
    }

    //ctx.fillStyle = 'black';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    for (let i = 0; i < data.length; i++) {
        const label = i + 1;
        const x = i * (canvas.width / data.length) + (canvas.width / data.length) / 2; // Adjusted for original position
        const y = graphHeight + 20; // Add margin
        ctx.fillText(label.toString(), x, y);
    }

    // Draw y-axis labels
    
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    
    // Ensure that the middle label represents half of maxValue
    let yAxisLabels = [];
    if(maxValue % 2 == 0) {
        yAxisLabels = [0, maxValue/2 , maxValue];
    } else {
        const top = Math.round(maxValue/2);
        const bottom = top-1;
        yAxisLabels = [0, bottom, top, maxValue];
    }
     
    
    for (let i = 0; i < yAxisLabels.length; i++) {
        const label = yAxisLabels[i];
        const x = 10;
        const y = graphHeight - (label / maxValue) * graphHeight + 20; // Add margin
        ctx.fillText(label.toString(), x, y);
    }
}
  

function startup() {
    const game = document.getElementById('game');
    drawGrid(game);

    Promise.all([
        fetch('words-all.txt').then(response => response.text()),
        fetch('new-secret.txt').then(response => response.text())
    ]).then(([wordleWords, secretWords]) => {
        dictionary = wordleWords.split('\n');
        secretWords = secretWords.split('\n');
        dictionary.concat(secretWords);

        setSecret(secretWords);
        console.log(state.secret); 
        updateGrid(); // Update grid to display the first row with empty boxes
        registerKeyboardEvents();
    }).catch(error => {
        console.error('Error loading words:', error);
    });
} 


let dictionary = [];

startup();
