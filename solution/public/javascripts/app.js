function initSocialMediaData() {
    loadData();
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker
            .register('./service-worker.js')
            .then(function () {
                console.log('Service Worker Registered');
            })
            .catch (function (error){
                console.log('Service Worker NOT Registered '+ error.message);
            });
    }
    //check for support
    if ('indexedDB' in window) {
        console.log("initializing database");
        initDatabase();
    }
    else {
        console.log('This browser doesn\'t support IndexedDB');
    }
}

function loadData() {
    var loggedInUser = document.cookie.split("=")[1];

    var localStoryList = JSON.parse(localStorage.getItem("stories"));
    if (localStoryList == null) localStoryList = [];

    if (window.location.pathname === '/profile') {
        localStoryList = localStoryList.filter(function (item) {
            return item.username === loggedInUser;
        });
    }

    var ratingStoryList = JSON.parse(localStorage.getItem('ratings'));
    if (ratingStoryList == null) ratingStoryList = [];

    // get ratings of the user logged in
    ratingStoryList = ratingStoryList.filter(function (element) {
        return element.username === loggedInUser;
    });


    // sort items by story date (helpful when adding to results)
    localStoryList = localStoryList.sort((a, b) => (a.story_date > b.story_date) ? 1 : -1);
    ratingStoryList = ratingStoryList.sort((a, b) => (a.rating_date > b.rating_date) ? 1 : -1);
    retrieveAllStoryData(localStoryList, ratingStoryList);
}

/**
 * it cycles through the list of cities and requests the data from the server for each
 * city
 * @param localStoryList
 * @param localRatingList
 */
function retrieveAllStoryData(localStoryList, localRatingList){
    refreshStoryList();
    for (var item in localStoryList) {
        if (localStoryList.hasOwnProperty(item)) {
            loadStoryData(localStoryList[item]);
        }
    }

    for (var ratingItem in localRatingList) {
        if (localRatingList.hasOwnProperty(ratingItem)) {
            loadRatingData(localRatingList[ratingItem])
        }
    }
}

/**
 * given one city and a date, it queries the server via Ajax to get the latest
 * weather forecast for that city
 * if the request to the server fails, it shows the data stored in the database
 * @param localStory
 */
function loadStoryData(localStory){
    var lastStoryUpdate = localStorage.getItem('lastStoryUpdate');
    if (lastStoryUpdate !== undefined) {
        if (localStory.story_date <= lastStoryUpdate ) {
            addStoryToResults(localStory);
            return;
        }
    }

    var input = JSON.stringify(localStory);

    ajaxRequest('/story_data', input, "application/json", "POST");
}

function loadRatingData(localRating) {
    var lastRatingUpdate = localStorage.getItem('lastRatingUpdate');
    if (lastRatingUpdate !== undefined) {
        if (localRating.rating_date <= lastRatingUpdate ) {
            addRatingToResults(localRating);
            return;
        }
    }

    var input = JSON.stringify(localRating);



    ajaxRequest('/rating_data', input, "application/json", "POST");
}

function getFormObject(form){
    const input = form.serializeArray();
    let formObject = {};
    input.forEach(function(element) {
       var formProperty = element['name'];
        formObject[formProperty] = element['value'];
    });

    return formObject;
}

function checkLoginData() {
    const form = $('#loginForm');
    const formObject = getFormObject(form);
    if (objectContainsEmpty(formObject)) {
        showMessage('error', 'Please fill all the fields.');
        return;
    }

    const input = JSON.stringify(formObject);

    $.ajax({
        url: '/login_check',
        data: input,
        contentType: 'application/json',
        type: 'POST',
        success: function (dataR) {
            // no need to JSON parse the result, as we are using
            // dataType:json, so JQuery knows it and unpacks the
            // object for us before returning it
            getLoginData(dataR);
        },
        // the request to the server has failed. Let's show the cached data
        error: function (xhr, status, error) {
            showOfflineWarning();
            //getCachedData(postId, date);
            const dvv = document.getElementById('offline_div');
            if (dvv != null)
                dvv.style.display = 'block';
        }
    });
}

function registerUser() {
    const form = $('#registerForm');
    const formObject = getFormObject(form);
    if (objectContainsEmpty(formObject)) {
        showMessage('error', 'Please fill all the fields.');
        return;
    }
    const input = JSON.stringify(formObject);

    $.ajax({
        url: '/register_user',
        data: input,
        contentType: 'application/json',
        type: 'POST',
        success: function (dataR) {
            // no need to JSON parse the result, as we are using
            // dataType:json, so JQuery knows it and unpacks the
            // object for us before returning it
            checkRegisterData(dataR);
        },
        // the request to the server has failed. Let's show the cached data
        error: function (xhr, status, error) {
            showOfflineWarning();
            //getCachedData(postId, date);
            const dvv = document.getElementById('offline_div');
            if (dvv != null)
                dvv.style.display = 'block';
        }
    });
}

function createPost(date) {
    // get inputs from form as an object
    const form = $('#postStoryForm');
    const formObject = getFormObjectWithImage(form);
    formObject.story_date = date;
    formObject.story_id = formObject.username + formObject.story_date;
    // TODO: CLIENT SIDE VALIDATION

    const storyInput = JSON.stringify(formObject);

    var storyList=JSON.parse(localStorage.getItem('stories'));
    if (storyList==null) storyList=[];
    storyList.push(formObject);
    localStorage.setItem('stories', JSON.stringify(storyList));

    ajaxRequest("/story_data", storyInput, "application/json", "POST");

    for (var j=1; j<=3; j++) {
        document.querySelector("#uploaded_image"+(j).toString()).src = "";
    }

    $("#story_text").val('');
}


function getFormObjectWithImage(form){
    const input = form.serializeArray();
    let formObject = {};
    input.forEach(function(element){
        var formProperty = element['name'];
        var formValue = element['value'];
        formObject[formProperty] = formValue;
    });


    let files = [];
    for (var i=0; i<3; i++){
        let img = document.querySelector("#uploaded_image" + (i + 1).toString());
        if (img.style.visibility !== 'hidden'){
            files[i] = img.src;
        }


    }

    formObject['input_image'] = files;
    return formObject;
}


function previewFile() {
    for (var j=1; j<=3; j++){
        document.querySelector("#uploaded_image"+(j).toString()).src = "";
    }
    //const preview = document.querySelector('img');
    //const file = document.querySelector('input[type=file]').files[0];
    //const reader = new FileReader();
    //let reader = new FileReader();
    let files = document.querySelector('input[type=file]').files;

    if (files.length>3){
        showMessage('error', "You can upload up to 3 images!")
    } else{
        console.log("fileslength", files.length);
        for (var i=0; i<files.length; i++) {
            let image = document.querySelector("#uploaded_image" + (i + 1).toString());
            let file = files[i];
            var reader = new FileReader();
            reader.addEventListener("load", function (event) {
                console.log(i);
                image.src = event.target.result;
                image.style.visibility = 'visible';
            });
            if (file) {
                reader.readAsDataURL(file);
            }
        }

        let clear_photos = document.querySelector("#clear_photos");
        clear_photos.style.visibility = 'visible';
    }

}

function clearPhotos(){
    for (var j=1; j<=3; j++){
        document.querySelector("#uploaded_image"+(j).toString()).src = "";
    }
}

///////////////////////// INTERFACE MANAGEMENT ////////////

/**
 * given the forecast data returned by the server,
 * it adds a row of weather forecasts to the results div
 * @param dataR the data returned by the server:
 * class WeatherForecast{
 *  constructor (location, date, forecast, temperature, wind, precipitations) {
 *    this.location= location;
 *    this.date= date,
 *    this.forecast=forecast;
 *    this.temperature= temperature;
 *    this.wind= wind;
 *    this.precipitations= precipitations;
 *  }
 *}
 */
function addStoryToResults(dataR) {
    if ($('#storyResults') != null) {
        const row = document.createElement('div');
        // appending a new row
        var storyResultsDiv = document.getElementById('storyResults');
        if (storyResultsDiv != null) {
            storyResultsDiv.insertBefore(row, storyResultsDiv.firstChild);
            var storyId = dataR.username+dataR.story_date;
            // formatting the row by applying css classes
            row.classList.add('card');
            row.classList.add('mb-4');
            row.id = storyId;
            // the following is far from ideal. we should really create divs using javascript
            // rather than assigning innerHTML
            console.log("Added to results to HTML");

            let images = [];
            if (dataR.input_image) {
                for (var j=0; j<dataR.input_image.length; j++){
                    images[j]= dataR.input_image[j];
                }
            }

            var d = new Date(dataR.story_date);
            var displayDate = d.toDateString() + " " + d.toTimeString().substr(0, 8);
            var storyCardImageId = "story_image"+storyId;
            var storyCard =
                "<h3 class=\"card-title ml-3 mt-1\">"+dataR.username+" " +
                "<span class='border-bottom pull-right ' style='font-size: 10pt'>"+displayDate+"</span>" +
                "</h3>";

            if (images.length !== 0) {
                storyCard +=
                    "<img class=\"card-img-top\" id="+ storyCardImageId+ "  src=" + dataR.input_image[0]+ " alt=\"Card_image_cap\" onclick=\"showModal(" + storyId + ")\" >";
                if (((dataR.input_image.length) - 1) !== 0)
                    storyCard += "<span id=\"photos_info\" class=\"plus_photos\"> "+ "&plus;" + (dataR.input_image.length - 1) + "</span>";
            }

            storyCard +=
                "<div class=\"card-body border-top\">" +
                "<p class=\"card-text\">"+dataR.story_text.replace(/\r?\n/g, '<br />')+"</p>" +
                "</div>" +
                "<div class=\"card-footer text-muted\"> Rate Story: ";

            // rating stars
            for (var i = 0; i<5; i++) {
                var starId = "star" + i;
                storyCard += "<i class = \"fa fa-star-o\" id="+starId+storyId+" onclick=\"handleRatingChange("+i+","+storyId+")\"></i>"
            }

            // undo rating button
            storyCard += "<a class='btn btn-sm text-white btn-danger pull-right' " +
                "id = 'undoRatingButton"+storyId+"' style='display:none' " +
                "onclick=\"handleRatingChange("+null+","+storyId+")\"> Undo Rating</a>";

            storyCard += "<span id= \"averageRating"+storyId+"\" class='pl-2'>Average Rating: "+getAverageRating(storyId)+"</span></div>";

            row.innerHTML = storyCard;
        }
    }
}

function getAverageRating(storyId) {
    var total = 0;
    var ratingCounter = 0;
    var localRatings = JSON.parse(localStorage.getItem('ratings'));
    for (var ratingItem in localRatings) {
        if (localRatings.hasOwnProperty(ratingItem)) {
            var ratingObject = localRatings[ratingItem];
            if (ratingObject.story_id === storyId && ratingObject.vote !== null) {
                ratingCounter += 1;
                total += ratingObject.vote;
            }
        }

    }

    var average = total/ratingCounter;

    if (isNaN(average)) average= -1;

    return average + 1;
}


function showModal(storyId){
    storyId = storyId.id;
    var story = JSON.parse(localStorage.getItem("stories")).find(function (item) {
        return (item.story_id === storyId);
    })

    var images = story.input_image;

    var modal = document.getElementById("modal");

    for (var i=0; i<images.length; i++){
        var modalImg = document.getElementById("img"+(i+1));
        modal.style.display = "block";
        modalImg.src = images[i];

    }

}

function closeModal(){
    let modal = document.getElementById("modal");
    let close = document.getElementById("close_button");

// When the user clicks on <span> (x), close the modal
    close.onclick = function() {
        modal.style.display = "none";
    }
}


/**
 * it removes all forecasts from the result div
 */
function refreshStoryList(){
    if (document.getElementById('storyResults')!=null)
        document.getElementById('storyResults').innerHTML='';
}

/**
 * When the client gets off-line, it shows an off line warning to the user
 * so that it is clear that the data is stale
 */
window.addEventListener('offline', function(e) {
    // Queue up events for server.
    console.log("You are offline");
    showOfflineWarning();
}, false);

/**
 * When the client gets online, it hides the off line warning
 */
window.addEventListener('online', function(e) {
    // Resync data with server.
    hideOfflineWarning();
    loadData();
}, false);


function showOfflineWarning(){
    alert("You are now offline.");
    if (document.getElementById('offline_div')!=null)
        document.getElementById('offline_div').style.display='block';
}

function hideOfflineWarning(){
    if (document.getElementById('offline_div')!=null)
        document.getElementById('offline_div').style.display='none';
}


function showMessage(type, message, timeout = null){
    const messageDiv = $('#message');
    // hide previous messages
    messageDiv.attr('class','');

    //show message
    var alertClass;
    if (type === "error") {
        alertClass = "alert-danger"
    } else if (type === "warning") {
        alertClass = "alert-warning"
    } else {
        alertClass = "alert-success"
    }

    if (message === "")
        messageDiv.html("");
    else
        messageDiv.addClass('alert ' + alertClass).html(message);

    if (timeout != null) {
        setTimeout(function () {
            hideMessage();
        }, timeout);
    }
}

function hideMessage() {
    $('#message').hide();
}

function objectContainsEmpty(object) {
    var objectValues = Object.values(object);

    //check if a key in the object is empty
    for (var value in objectValues) {
        if (objectValues[value] === "" || objectValues[value] === undefined) {
            return true;
        }
    }

    return false;
}

function ajaxRequest(url, data, contentType, type){
    // AJAX call to story_data POST method which returns the object to be
    // stored in IndexedDB
    $.ajax({
        url: url,
        data: data,
        contentType: contentType,
        type: type,
        success: function (dataR) {
            hideOfflineWarning();
            if (url === '/story_data') {
                // no need to JSON parse the result, as we are using
                // dataType:json, so JQuery knows it and unpacks the
                // object for us before returning it
                storeStoryData(dataR);
                //localStorage.setItem(dataR.username + dataR.story_date, JSON.stringify({story: dataR, addedToDB: true}))
                addStoryToResults(dataR);
                localStorage.setItem('lastStoryUpdate', JSON.stringify(Date.now()));
            } else if (url === '/rating_data') {
                console.log("POST RATING DATA", dataR)
                storeRatingData(dataR);
                addRatingToResults(dataR);
                localStorage.setItem('lastRatingUpdate', JSON.stringify(Date.now()));
            }
        },
        // the request to the server has failed. Let's show the cached data
        error: function (xhr, status, error) {
            // handle service worker fetch post method error
            if (xhr.status === 400) {
                return;
            }
            showMessage("warning",
                "You are offline. Changes will be updated as soon as you have a connection",
                2500);

            if (url === '/story_data') {
                addStoryToResults({});
            } else if (url === '/rating_data') {
                addRatingToResults(JSON.parse(data));
            }
        }
    });
}

function getLocalStoryList() {
    var objectList = [];
    for (var key in localStorage) {
        if (localStorage.hasOwnProperty(key) && key !== "lastStoryUpdate") {
            var obj = localStorage.getItem(key);
            if (window.location.pathname === "/profile") {
                if (JSON.parse(obj)) {
                    if (JSON.parse(obj).username === document.cookie.split("=")[1]) {
                        objectList.push(JSON.parse(obj));
                    }
                }
            } else {
                objectList.push(JSON.parse(obj));
            }
        }
    }

    return objectList;
}

function handleRatingChange(n, storyId) {
    storyId = storyId.id;
    var username = document.cookie.split("=")[1]

    var ratingDate = Date.now();

    var ratingItem = {story_id: storyId, username: username, vote: n, rating_date: ratingDate}


    var ratingList = JSON.parse(localStorage.getItem('ratings'));
    if (ratingList == null) ratingList = []
    ratingList.push(ratingItem);
    console.log("Rating List", ratingList);

    // find any duplicates
    var previousRating = ratingList.find(function (item) {
        return item.story_id === storyId &&
            item.username === username &&
            item.rating_date !== ratingDate;
    });


    // delete the previous rating from ratingList
    if (ratingList.indexOf(previousRating) > -1){
        ratingList.splice(ratingList.indexOf(previousRating), 1)
    }

    // store it in local storage
    localStorage.setItem("ratings", JSON.stringify(ratingList));

    $('#'+"averageRating"+storyId).text("Average Rating: " + getAverageRating(storyId));

    addRatingToResults(ratingItem);

    ajaxRequest('/rating_data', JSON.stringify(ratingItem), 'application/json', "POST" )
}

function addRatingToResults(ratingObject) {
    var storyId = ratingObject.story_id;
    var n = ratingObject.vote;

    var undoRatingButton = $('#' + "undoRatingButton" + storyId);

    undoRatingButton.show()

    var storyCard = $('#' + storyId);

    if (ratingObject.vote === null) {
        for (var k = 0; k<5; k++) {
            storyCard.find($('#' + 'star' + k + storyId)).attr('class', 'fa fa-star-o')
        }

        undoRatingButton.hide()
        return;
    }

    // change UI
    for (var i = 0; i <= n; i++) {
        var storyStar = storyCard.find($('#' + 'star' + i + storyId))
        storyStar.attr('class', 'fa fa-star')
    }
    for (var j = n; j < 5; j++) {
        var nextStoryStar = storyCard.find($('#' + 'star' + (j+1) + storyId))
        nextStoryStar.attr("class", 'fa fa-star-o');
    }
}

function resetStarRating(storyId) {
    storyId = storyId.id;
    var storyCard = $('#' + storyId)


}