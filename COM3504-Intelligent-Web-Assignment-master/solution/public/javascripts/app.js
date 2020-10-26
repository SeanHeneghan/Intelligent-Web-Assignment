/**
 * initialise indexedDB database
 * sync data of localStorage and indexedDb with mongo data
 * register the service worker
 */
async function initSocialMediaData() {

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

    //take data from mongo and store in client site to display to user even if offline
    if ((navigator.onLine) && (window.location.pathname !=='/profile'))
        await syncData();
    loadData();
}

/**
 * sync data with mongo
 * sync stories and ratings (not logins for security)
 */
async function syncData() {
    localStorage.clear();
    await clearRecords();
    ajaxRequest('/sync_ratings', "", "application/json", "POST");
    ajaxRequest('/sync_stories', "", "application/json", "POST");
}

/**
 * load the stories and display them on the wall
 */
function loadData(byDate = false) {
    var loggedInUser = document.cookie.split("=")[1];

    var localStoryList = JSON.parse(localStorage.getItem("stories"));
    if (localStoryList == null) localStoryList = [];
    console.log(localStoryList[0]);

    var ratingStoryList = JSON.parse(localStorage.getItem('ratings'));
    if (ratingStoryList == null) ratingStoryList = [];

    // get ratings of the user logged in
    ratingStoryList = ratingStoryList.filter(function (element) {
        return element.username === loggedInUser;
    });

    //if in profile show only stories of that user
    if (window.location.pathname === '/profile') {
        localStoryList = localStoryList.filter(function (item) {
            return item.username === loggedInUser;
        });
    }
    // sort items by story date if chosen
    if (byDate){
        localStoryList = localStoryList.sort((a, b) => (a.story_date > b.story_date) ? 1 : -1);
        ratingStoryList = ratingStoryList.sort((a, b) => (a.rating_date > b.rating_date) ? 1 : -1);
    }

    //if there are stories in local storage show them
    if ((localStoryList.length>0) || (window.location.pathname === '/profile')) {
        toggleGUIDisplay();
        retrieveAllStoryData(localStoryList, ratingStoryList);
    }

    if (window.location.pathname !== '/profile'){
        // clear the search input
        document.getElementById('search_text').value = "";
        document.querySelector('#refreshButton').style.visibility = 'hidden';
        document.querySelector('#refreshButton').style.display = 'none';
    }
}

/**
 * event listener to handle display by date
 * if pressed toggle between displaying by date and displaying by recommendation
 */
if ((window.location.pathname !== '/login') && (window.location.pathname !== '/signup'))  {
    document.getElementById('toggleStoriesOrder').addEventListener('change', (e) => {
        this.toggleStoriesOrder = e.target.checked ? 'on' : 'off';
        if (this.toggleStoriesOrder === 'on') {
            loadData(true);
        } else {
            loadData(false);
        }
    });
}
/**
 * toggle the GUI display to handle the change until all stories all loaded
 * stories are being displayed but prevents user from choosing to search or see by date
 * until all the stories are loaded
 */
function toggleGUIDisplay(){

    if (window.location.pathname !== '/profile') {
        if (document.querySelector('#loadingButton').style.visibility == 'visible')
            document.querySelector('#loadingButton').style.visibility = 'hidden';
        else document.querySelector('#loadingButton').style.visibility = 'visible';


        if (document.querySelector('#searchStoriesInput').style.visibility == 'visible') {
            document.querySelector('#searchStoriesInput').style.visibility = 'hidden';
            document.querySelector('#searchStoriesInput').style.display = 'none';
        } else {
            document.querySelector('#searchStoriesInput').style.visibility = 'visible';
            document.querySelector('#searchStoriesInput').style.display = 'inline';
        }

    }

    if (document.querySelector('#viewByDateSwitch').style.visibility == 'visible') {
        document.querySelector('#viewByDateSwitch').style.visibility = 'hidden';
        document.querySelector('#viewByDateSwitch').style.display = 'none';
    } else {
        document.querySelector('#viewByDateSwitch').style.visibility = 'visible';
        document.querySelector('#viewByDateSwitch').style.display = 'inline';
    }

}

/**
 * get a form and return key value of the fields
 * @param form
 * @returns {{}} object value array of the form objects
 */
function getFormObject(form){
    const input = form.serializeArray();
    let formObject = {};
    input.forEach(function(element) {
       var formProperty = element['name'];
        formObject[formProperty] = element['value'];
    });

    return formObject;
}

/**
 * clear the fields of a form
 */
function clearFormFields(form){
    const input = form.serializeArray();
    input.forEach(function(element) {
        element['value'] = "";
    });
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

/**
 * show offline warning message
 */
function showOfflineWarning(){
    alert("You are now offline.");
    if (document.getElementById('offline_div')!=null)
        document.getElementById('offline_div').style.display='block';
}

/**
 * hide the offline warning message
 */
function hideOfflineWarning(){
    if (document.getElementById('offline_div')!=null)
        document.getElementById('offline_div').style.display='none';
}

/**
 * show message for feedback to the user
 * @param type the type of  message to be displayed (error/success/warning)
 * @param message the string to show in the error message
 * @param timeout how long the message to be displayed
 */
function showMessage(type, message, timeout = null){
    const messageDiv = $('#message');
    messageDiv.show();
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

/**
 * hide the message
 */
function hideMessage() {
    $('#message').hide();
}

/**
 * check if an object contains an empty value
 * @param object
 * @returns {boolean}
 */
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

/**
 * create ajax request
 * @param url
 * @param data
 * @param contentType
 * @param type
 * @param processData
 */
function ajaxRequest(url, data, contentType, type, processData=true){
    // AJAX call to story_data POST method which returns the object to be
    // stored in IndexedDB
    $.ajax({
        url: url,
        data: data,
        contentType: contentType,
        processData: processData,
        type: type,
        async: false,
        success: function (dataR) {
            hideOfflineWarning();
            // when a new story is being posted
            if (url === '/story_data') {
                addStoryToResults(dataR, true);
                if (document.cookie.split('=')[1] === dataR.username)
                    showMessage('success', 'Story posted!', 2500);
                //update the date of last storage update
                localStorage.setItem('lastStoryUpdate', JSON.stringify(Date.now()));
                //send story to socket
                socket.emit('new_story', JSON.stringify(dataR));
            // when a new rating is done
            } else if (url === '/rating_data') {
                //update the date of last storage update
                localStorage.setItem('lastRatingUpdate', JSON.stringify(Date.now()));
                //send story to socket
                socket.emit('new_rating', JSON.stringify(JSON.stringify(dataR)));
            // sync the stories
            } else if (url === '/sync_stories') {
                if (dataR !== undefined)
                    storeMongoStories(dataR);
            // sync the ratings
            } else if (url === '/sync_ratings') {
                if (dataR !== undefined)
                    storeMongoRatings(dataR);
            } else if (url.startsWith('/upload_json')){
                //wait until data is stored and loaded
                toggleGUIDisplay();
                document.querySelector('#loadingButton').style.visibility = 'hidden';
                document.querySelector('#loadingButton').style.display = 'none';
                document.querySelector('#loadingButtonAdmin').style.visibility = 'visible';
                document.querySelector('#loadingButtonAdmin').style.display = 'inline';
                window.setTimeout(loadingData, 8000);

            }
        },
        // the request to the server has failed
        error: function (xhr, status, error) {
            // handle service worker fetch post method error
            if (xhr.status === 400) {
                return;
            }
            showMessage("warning",
                "You are offline. Changes will be updated as soon as you have a connection.",
                2500);
            if (url === '/story_data') {
                addStoryToResults({}, true);
            } else if (url === '/rating_data') {
                addRatingToResults(JSON.parse(data));
            }
        }
    });
}

/**
 * show loading message until data is stored and loaded
 */
function loadingData(){
    document.querySelector('#loadingButtonAdmin').style.visibility = 'hidden';
    document.querySelector('#loadingButtonAdmin').style.display = 'none';
    location.reload();
}

/**
 * show the json file name that the user has uploaded
 * user must know which file will be uploaded
 * diplay it and allow to clear if these are not correct
 */
function previewUploadFile() {
    document.querySelector("#uploaded_json").innerHTML = "";
    document.querySelector("#uploaded_json").style.visibility = "hidden";

    let files = document.querySelector('#input_json').files;
    console.log(files[0].name)
    let clear_files = document.querySelector("#clear_files");
    if (files.length>1) {
        showMessage('error', "Please select one JSON file to upload", 2500);
        clear_files.style.visibility = 'hidden';
        $('#clear_files').hide();
    } else {
        let uploadSpan = document.querySelector("#uploaded_json");
        let file = files[0];
        var reader = new FileReader();

        reader.addEventListener("load", function (event) {
            uploadSpan.innerHTML = files[0].name
            uploadSpan.style.visibility = 'visible';
        });

        if (file) {
            reader.readAsDataURL(file);
        }

        clear_files.style.visibility = 'visible';
        clear_files.style.display = 'inline';
    }


}

/**
 * clear the photos from the preview section
 */
function clearUploadFile(){
    let spanFile = document.querySelector('#uploaded_json');
    let clear_file = document.querySelector('#clear_files');
    spanFile.innerHTML = "";

    clear_file.style.visibility = 'hidden';
    clear_file.style.display = 'none'

    $("#input_json").val('');
}

/**
 * function to get the file from the form and
 * upload the json file by calling an ajax post method.
 */

function uploadFile() {

    const uploadedFile = document.querySelector('#input_json').files[0];

    if (!uploadedFile) {
        showMessage("error", "Please upload a JSON file", 2500);
        return;
    }

    let data = {uploadedFile: uploadedFile.name};
    ajaxRequest('/upload_json/'+uploadedFile.name, JSON.stringify(data), false, "POST")



    console.log(uploadedFile);

}