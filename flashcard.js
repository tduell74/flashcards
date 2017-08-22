// NPM packages
var inquirer = require("inquirer");
var fs = require("fs");

//----------global variables----------//
var questionBankArray = []; // will hold the array of generated flashcards if user selects "quiz"
var randomNum = 0;
var n = 0; // will hold the questionBankArray length
var typeofCard = ""; // either cloze or basic
var quizDisplayCount = 0;
var partialString = "";
var textString = "";
var novoBasicCard; // variable for storing the new BasicCard object
var novoClozeCard; // variable for storing the new ClozeCard object
var validate;
var lazinessCheatCount = 0;

// scope safe basic card constructor function
function BasicCard(basicFront, basicBack) {
    if (this instanceof BasicCard) {
        this.basicFront = basicFront;
        this.basicBack = basicBack;
    } else {
        return new BasicCard(basicFront, basicBack);
    }
}

// scope safe cloze card constructor function 
function ClozeCard(clozeFront, clozeBack) {
    if (this instanceof ClozeCard) {
        this.clozeFront = clozeFront;
        this.clozeBack = clozeBack;
    } else {
        return new ClozeCard(clozeFront, clozeBack);
    }
}

//clozeCard method for getting the cloze flashcard
ClozeCard.prototype.getPartial = function() {
    console.log(`Your formatted ClozeCard is:\n\n   ${partialString}\n`);
}

// starting function executed upon program load
// gives the user a list of four choices, and executes functions accordingly
var start = function() {
    inquirer.prompt([{
        name: "card",
        type: "list",
        message: "How can I assist you with your learning?\n",
        choices: ["make a basic flashcard", "make a cloze flashcard", "quizme", "I don't want to learn"]
    }]).then(function(answer) {

        switch (answer.card) {
            case "make a basic flashcard":
                makeBlankCard();
                break;

            case "make a cloze flashcard":
                makeClozeCard();
                break;

            case "quizme":
                quizMe();
                break;

            case "I don't want to learn":
                lazy();
                break;

        }
    });
}
start();

// inquirer prompts for making the blank cards
function makeBlankCard() {
    inquirer.prompt([{
            name: "blankquestion",
            type: "input",
            message: "Type a question"

        }, {
            name: "blankanswer",
            type: "input",
            message: "Type in an answer to your question"

        }, {
            name: "confirmation",
            type: "confirm",
            message: "Would you like to add another notecard?"
        }


    ]).then(function(answer) {
        // gathers user input and creates a new BasicCard object and stores it in novoBasicCard

        novoBasicCard = BasicCard(answer.blankquestion, answer.blankanswer);

        // uses the JSON.stringify function to format our object and append it to the file
        // semicolon separates each successive object appended
        fs.appendFile("basicbank.txt", ';' + JSON.stringify(novoBasicCard), function(err) {

            // If the code experiences any errors it will log the error to the console.
            if (err) {
                return console.log(err);
            }
        });

        // if user wanted to make another basic card, it recursively calls itself
        if (answer.confirmation) {
            makeBlankCard()
        } else {
            return;
        }

    });
}

function makeClozeCard() {
    inquirer.prompt([{
            name: "fulltextq",
            type: "input",
            message: "Type in a question"

        }, {
            name: "clozeq",
            type: "input",
            message: "Type in the cloze"

        }, {
            name: "confirmation",
            type: "confirm",
            message: "Would you like to add another notecard?"
        }


    ]).then(function(answer) {

        novoClozeCard = ClozeCard(answer.fulltextq, answer.clozeq);
        validate = answer.confirmation;
        // uses the JSON.stringify function to format our object and append it to the file
        // semicolon separates each successive object appended
        fs.appendFile("clozebank.txt", ';' + JSON.stringify(novoClozeCard), function(err) {

            // If the code experiences any errors during the append process it will log the error to the console.
            if (err) {
                return console.log(err);
            }
        });
        validCloze();
    });
}

// validates whether the user correctly inputed the cloze card
function validCloze() {

    textString = novoClozeCard.clozeFront;
    var bool = textString.includes(novoClozeCard.clozeBack); // see if the question contains the cloze statement  (returns true or false)
    partialString = textString.replace(novoClozeCard.clozeBack, "__________"); // stores formatted flashcard which is used if the getPartial function is called

    // if the user inputs an invalid cloze statement, they are prompted to retry
    if (bool === false) {
        console.log("\n\nERROR!!! Somewhere in your question you must have your cloze word");
        console.log(`Example:  
            ?Type in a question:      George Washington was the first president of the United States 
            ?Type in the cloze:       George Washington\n 
--------------------------------------------------------------------------------------------\n\nTRY AGAIN!!!!\n `);
        makeClozeCard();
    }

    // if user flashcard is valid and they want to create another one
    if (validate && bool === true) {
        console.log("\nYou successfully created a cloze flashcard!!!");

        novoClozeCard.getPartial(); // displays the users generated clozeCard and recalls the makeClozeCard function
        makeClozeCard();
    }

    // if user flashcard is valid and they do not want to create another one
    if (!validate && bool === true) {
        console.log("\nYou successfully created a cloze flashcard!!!");
        novoClozeCard.getPartial(); // displays the users generated clozeCard 
    }


}

/ if user selects quiz, then they get to choose from which cardset
function quizMe() {
    inquirer.prompt([{
            name: "cardtype",
            type: "list",
            message: "Which cardset would you like to review?",
            choices: ["cloze", "basic"]
        }

    ]).then(function(answer) {

        if (answer.cardtype === "cloze") {
            readBank("clozebank.txt", "cloze");
        } else {
            readBank("basicbank.txt", "basic");
        }

    });
}