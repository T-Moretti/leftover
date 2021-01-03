'use strict'

// my personal API key
const myKey = '56ba5f221e0546048b50749580e074c1'

// main API - ingredient recipe search
const searchURL = 'https://api.spoonacular.com/recipes/complexSearch'


function formatQueryParams(params) {
    const queryItems = Object.keys(params) 
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    return queryItems.join('&');
}

// inserts recipe instructions
function insertInstructions(id, responseJson) {
    let instructionsArray = responseJson; 
    let htmlToInsert = "<h3>Instructions</h3><ul>";   
    for (let i = 0; i < instructionsArray[0].steps.length; i++) {
        htmlToInsert = htmlToInsert + `<li>${instructionsArray[0].steps[i].step}</li>`;
    }
    htmlToInsert = htmlToInsert + `</ul>`; 
    $(`#${id}`).append(htmlToInsert);
}

// grabs recipe instructions
function findRecipeInstructions(id) {
    const params = {
        apiKey: myKey
    };
    const queryString = formatQueryParams(params);
    const instructionsURL = `https://api.spoonacular.com/recipes/${id}/analyzedInstructions`;
    const instructionsURLWithParams = instructionsURL + '?' + queryString;
   
    fetch(instructionsURLWithParams)
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            throw new Error(response.statusText);
        })
        .then((responseJson) => {
            insertInstructions(id, responseJson);
        })
        .catch(error => {
            $('#js-error-message').text(`Something went wrong: ${error.message}`)
        });
}

// inserts recipe ingredients 
function insertIngredients(id, responseJson) {
    let ingredientsArray = responseJson.ingredients;
    let htmlToInsert = "<h3>Ingredients</h3><ul>";   
    for (let i = 0; i < ingredientsArray.length; i++) {
        htmlToInsert = htmlToInsert + `<li>${ingredientsArray[i].name} - ${ingredientsArray[i].amount.us.value} ${ingredientsArray[i].amount.us.unit}</li>`;
    }
    htmlToInsert = htmlToInsert + `</ul>`; 
    $(`#${id}`).append(htmlToInsert);
}

// grabs recipe ingredients 
function findRecipeIngredients(id) { 
    const params = {
        apiKey: myKey
    };
    const queryString = formatQueryParams(params)
    const ingredientsURL  = `https://api.spoonacular.com/recipes/${id}/ingredientWidget.json`; 
    const ingredientsURLWithParams = ingredientsURL + '?' + queryString;

    fetch(ingredientsURLWithParams)
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            throw new Error(response.statusText);
        })
        .then((responseJson) => {
          insertIngredients(id, responseJson); 
          findRecipeInstructions(id);
        })
        .catch(error => {
            $('#js-error-message').text(`Something went wrong: ${error.message}`)
        });
}


// currently displays all results - There are two other functions, one called at the 
// bottom here, the other within that one
function displayResults(responseJson) {
    $('#results').empty();
    $('#js-error-message').empty();
    if (responseJson.results.length === 0) {
        $('#js-error-message').text(`Oops couldn't find any recipes based on your search. Please try again.`);
    } else {
        for (let i = 0; i < responseJson.results.length; i++) {
            let image = responseJson.results[i].image;
            let recipeID = responseJson.results[i].id;
            $('#results').append(`<div id=${recipeID} class='result'><h2>${responseJson.results[i].title}</h2>
            <img src='${image}' alt='Recipe Picture'></div>`);
              
            findRecipeIngredients(recipeID);
            
            $('.results').removeClass('hidden');
        }
    }
}

// this function fetches the intitial recipe results 
function findRecipeResults(searchTerm) {
    const params = {
        query: searchTerm,
        apiKey: myKey,
        number: 2
    };
    const queryString = formatQueryParams(params)
    const url = searchURL + '?' + queryString;

    fetch(url)
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            throw new Error(response.statusText);
        })
        .then((responseJson) => {
            displayResults(responseJson);
        })
        .catch(error => {
            $('#js-error-message').text(`Something went wrong: ${error.message}`)
        });
}

// runs the submit event, then calls findRecipeResults function
function watchForm() {
    $('form').submit(event => {
        event.preventDefault();
        const searchTerm = $('#js-search-term').val();
        findRecipeResults(searchTerm); 
    })
}

// starting point
$(watchForm);
