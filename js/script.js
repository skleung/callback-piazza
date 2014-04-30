(function(window, document, undefined) {

    // pane elements
    var rightPane = document.getElementById('right-pane');
    var leftPane = document.getElementById('left-pane');
    // TODO: add other panes here

    // button and input elements
    var interactors = document.getElementById('interactors');
    var search = document.getElementById('search');
    // TODO: add button/input element selectors here
    rightPane.addEventListener("submit", function(event){
        if (event.target.id === "question-form"){
            event.preventDefault();
            document.getElementById("form-errors").innerHTML = "";//clears previous error messages
            addQuestion(event.target);
        }else if(event.target.id === "response-form"){
            event.preventDefault();
            addResponse(event.target);
        }
    });

    rightPane.addEventListener("click", function(event){
        if (event.target.className === "resolve btn"){
            event.preventDefault();
            var question_id = document.getElementById("response-form").question_id.value;
            resolveQuestion(question_id);
        }else if (event.target.className === "redirect"){
            event.preventDefault();
            rightPane.innerHTML = templates.renderExpandedQuestion(getMap()[event.target.id]);
        }else if (event.target.className === "tag"){
            //will search the database for any matching tags.
            event.preventDefault();
            search.value = event.target.innerHTML;
            var results = searchQuestions(event.target.innerHTML);  
            leftPane.innerHTML = templates.renderQuestions({questions: results});
        }
    });

    leftPane.addEventListener("click", function(event){
        var cur = event.target;
        while (cur != leftPane){
            if(cur.className==="list-question question-info"){
                displayQuestion(cur.id);
                return;
            }
            cur = cur.parentNode;   
        }
    });

    interactors.addEventListener("click", function(event){
        if (event.target.className === "btn"){
            rightPane.innerHTML = templates.renderQuestionForm();
        }
    });

    search.addEventListener("keyup", function(event){
        if(search.value){
            var query = search.value;
            var results = searchQuestions(query);  
            leftPane.innerHTML = templates.renderQuestions({questions: results});
        }else{
            leftPane.innerHTML = templates.renderQuestions({questions: getQuestions()});
        }
    });
    // script elements that correspond to Handlebars templates
    var questionsTemplate = document.getElementById('questions-template');
    var questionFormTemplate = document.getElementById('question-form-template');
    var expandedQuestionTemplate = document.getElementById('expanded-question-template');
    var redirectTemplate = document.getElementById('redirect-template');
    var welcomeTemplate = document.getElementById('welcome-template');
    // compiled Handlebars templates
    var templates = {
        renderWelcome: Handlebars.compile(welcomeTemplate.innerHTML),
        renderQuestionForm: Handlebars.compile(questionFormTemplate.innerHTML),
        renderQuestions: Handlebars.compile(questionsTemplate.innerHTML),
        renderExpandedQuestion: Handlebars.compile(expandedQuestionTemplate.innerHTML),
        renderRedirect: Handlebars.compile(redirectTemplate.innerHTML)
    };
    function searchQuestions(query){
        var map = getMap();
        var searched = [];
        for (key in map){
            var q = map[key];
            //the key is actually the question and subject concatenated together
            console.log("q = "+q);
            console.log("responses = "+ q.responses);
            var contents = key + " " +q.responses.toString() + q.tags.toString();
            if (contents.indexOf(query)>=0){
                searched.push(map[key]);
            }
        }
        return searched;
    }
    /* resolves the question associated with the question_id that is passed in */
    function resolveQuestion(question_id){
        var map = getMap();
        delete map[question_id];
        storeMap(map);
        leftPane.innerHTML = templates.renderQuestions({questions: getQuestions()});
        rightPane.innerHTML = templates.renderQuestionForm(); 
    }
    /* displays the question with the extended question template */
    function displayQuestion(q_id){
        var map = getMap();
        rightPane.innerHTML = templates.renderExpandedQuestion(map[q_id]);
    }
    function addResponse(answer){
        var name = answer.name.value;
        var response = answer.response.value;
        if (name && response){//ensures these values aren't empty
            var q_id = answer.question_id.value;
            var map = getMap();
            map[q_id].responses.push({name: name, response: response});
            storeMap(map);
            //re-renders right pane to clear form and update responses
            rightPane.innerHTML = templates.renderExpandedQuestion(map[q_id]);
        }
    }
    /* simple random id generator */
    // function makeid(){
    //     var id = "";
    //     var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    //     for( var i=0; i < 6; i++ )
    //         text += possible.charAt(Math.floor(Math.random() * possible.length));
    //     return id;
    // }

    function error(msg){
        var errors = document.getElementById('form-errors');
        var error = document.createElement("li");
        error.innerHTML = msg;
        errors.appendChild(error);
    }

    function redirect(start, link, end, redirect_id){
        var notice = document.getElementById('form-notice');
        var redirect_obj = {msg_start: start, link_text: link, msg_end: end, redirect_id: redirect_id};
        notice.innerHTML = templates.renderRedirect(redirect_obj);
    }
    /* Adds a question to local storage and to the left pane */
    function addQuestion(formElement){
        var subject_val = formElement.subject.value;
        var question_val = formElement.question.value;
        if(subject_val && question_val){
            var q_id = subject_val+" "+question_val;
            var map = getMap();

            var tags = formElement.tagged.value.split(',');

            var new_q = {subject: subject_val, question: question_val, id: q_id, responses: [], tags: tags};
            //check if question has been asked before
            if (q_id in map) {
                redirect("Duplicate question: click ", "here", "to view", q_id);
                return; 
            }else if(question_val.length > 500){
                error("question has exceeded the character limit!");
                return;
            }
            //questions.unshift(new_q);
            map[q_id] = new_q;
            storeMap(map);
            //storeQuestions(questions);//adds to the local storage
            leftPane.innerHTML = templates.renderQuestions({questions: getQuestions()});
            rightPane.innerHTML = templates.renderQuestionForm();
        }else{
            error("Empty subject or question field.");
        }
    }
    /*Similarity function: Rudimentary measure of the similarity of two strings
    1. 

    */

    /* Returns the questions in the map */
    function getQuestions(){
        var questions = [];
        var map = getMap();
        for(var key in map){
            questions.push(map[key]);
        }
        return questions;
    }
    /* Returns the questions stored in localStorage. */
    // function getStoredQuestions() {
    //     if (!localStorage.questions) {
    //         // default to empty array
    //         localStorage.questions = JSON.stringify([]);
    //     }

    //     return JSON.parse(localStorage.questions);
    // }
    /* Returns the question map stored in localStorage. */
    function getMap() {
        if (!localStorage.map) {
            // default to empty array
            localStorage.map = JSON.stringify({})
        }
        return JSON.parse(localStorage.map);
    }
    /* Store the given questions array in localStorage.
     *
     * Arguments:
     * questions -- the questions array to store in localStorage
     */
    // function storeQuestions(questions) {
    //     localStorage.questions = JSON.stringify(questions);
    // }
     /* Store the given questions array in localStorage.
     *
     * Arguments:
     * map of questions and responses -- the question map to store in localStorage
     */
    function storeMap(questionMap){
        localStorage.map = JSON.stringify(questionMap);
    }

    // TODO: tasks 1-5 and one extension

    // display question form initially
    rightPane.innerHTML = templates.renderWelcome();
    leftPane.innerHTML = templates.renderQuestions({questions: getQuestions()});

    // TODO: display question list initially (if there are existing questions)

})(this, this.document);
