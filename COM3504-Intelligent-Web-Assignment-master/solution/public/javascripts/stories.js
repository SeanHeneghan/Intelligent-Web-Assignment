/**
 * refreshes the story list
 * and handles the display of the stories on the wall
 * stories are sent in intervals to avoid delays if many stories exist
 * @param localStoryList
 * @param localRatingList
 */
function retrieveAllStoryData(localStoryList, localRatingList){
    refreshStoryList();

    var storyPost = setInterval(function () {
        loadStoryData(localStoryList[localStoryList.length - 1]);
        localStoryList.pop();

        if (localStoryList.length === 0) {
            clearInterval(storyPost);
            // toggle the GUI display once finished
            toggleGUIDisplay();
            return;
        }
    }, 0)

    for (var ratingItem in localRatingList) {
        if (localRatingList.hasOwnProperty(ratingItem)) {
            loadRatingData(localRatingList[ratingItem])
        }
    }
}

function loadStoryData(localStory){
    var maxStories = 50;
    var c = 0;
    var lastStoryUpdate = localStorage.getItem('lastStoryUpdate');
    if (lastStoryUpdate !== undefined) {
        if (localStory.story_date <= lastStoryUpdate ) {
            addStoryToResults(localStory, false);
            return;
        }
    }
    var input = JSON.stringify(localStory);
    ajaxRequest('/story_data', input, "application/json", "POST");
}

/**
 * create a new post and add it to the wall
 * handle the images and send ajax request to store the data
 * @param date the date of the post
 */
function createPost(date) {
    // get inputs from form as an object
    const form = $('#postStoryForm');
    const formObject = getFormObjectWithImage(form);

    if (formObject.input_image.length > 0 || formObject.story_text.length > 0){
        formObject.story_date = date;
        // compose the story id
        formObject.story_id = formObject.username + formObject.story_date;

        const storyInput = JSON.stringify(formObject);

        var storyList=JSON.parse(localStorage.getItem('stories'));
        if (storyList==null) storyList=[];
        storyList.push(formObject);
        // store in client-site storage and send ajax request
        localStorage.setItem('stories', JSON.stringify(storyList));
        storeStoryData(formObject);
        ajaxRequest("/story_data", storyInput, "application/json", "POST");

        // clear the area where images are displayed after storing the post
        for (var j=1; j<=3; j++) {
            document.querySelector("#uploaded_image"+(j).toString()).src = "";
            document.querySelector("#uploaded_image"+(j).toString()).style.visibility = 'hidden';
        }

        // clear the form
        $("#story_text").val('');
        document.querySelector("#clear_photos").style.visibility = 'hidden';
    }

}

/**
 * get the form and return key-value of the items of the form including images
 * @param form
 * @returns {{}}
 */
function getFormObjectWithImage(form){
    const input = form.serializeArray();
    let formObject = {};
    input.forEach(function(element){
        var formProperty = element['name'];
        var formValue = element['value'];
        formObject[formProperty] = formValue;
    });

    // get the files
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

/**
 * show the images the user has uploaded
 * user must know which images will be uploaded
 * diplay them and allow to clear if these are not correct
 */
function previewFile() {

    for (var j=1; j<=3; j++){
        document.querySelector("#uploaded_image"+(j).toString()).src = "";
        $('#'+'uploaded_image'+(j.toString())).hide();
    }

    let files = document.querySelector('input[type=file]').files;

    // upload supports up to 3 images
    if (files.length>3){
        showMessage('error', "You can upload up to 3 images!", 2500);
        let clear_photos = document.querySelector("#clear_photos");
        clear_photos.style.visibility = 'hidden';
        $('#clear_photos').hide();
        //read the files with FileReader
    } else if (files.length>0){
        //console.log("fileslength", files.length);
        for (var i=0; i<files.length; i++) {
            let image = document.querySelector("#uploaded_image" + (i + 1).toString());
            $('#'+'uploaded_image'+((i+1).toString())).show();
            let file = files[i];
            var reader = new FileReader();
            reader.addEventListener("load", function (event) {
                image.src = event.target.result;
                image.style.visibility = 'visible';
            });
            if (file) {
                reader.readAsDataURL(file);
            }
        }
        // enable the clear photos button
        let clear_photos = document.querySelector("#clear_photos");
        clear_photos.style.visibility = 'visible';
        $('#clear_photos').show();
    }

}

/**
 * clear the photos from the preview section
 */
function clearPhotos(){
    for (var j=1; j<=3; j++){
        var image = document.querySelector("#uploaded_image"+(j).toString());
        image.src = "";
        image.style.visibility = 'hidden';
        $('#'+'uploaded_image'+j.toString()).hide();
    }

    let clear_photos = document.querySelector("#clear_photos");
    clear_photos.style.visibility = 'hidden';
    $('#clear_photos').hide();
}

/**
 * add a new story to the wall
 * creates a new story card with innerHTML and adds it to the wall
 * @param dataR the story to be posted
 * @param addToTop
 */
function addStoryToResults(dataR, addToTop) {
    if ($('#storyResults') != null) {
        const row = document.createElement('div');

        // appending a new row
        var storyResultsDiv = document.getElementById('storyResults');
        if (storyResultsDiv != null) {
            if (addToTop) {
                storyResultsDiv.insertBefore(row, storyResultsDiv.firstChild);
            } else {
                storyResultsDiv.appendChild(row);
            }
            var storyId = dataR.story_id;
            // formatting the row by applying css classes
            row.classList.add('card');
            row.classList.add('mb-4');
            row.id = storyId;

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

            // handles the images
            if (images.length !== 0) {
                storyCard +=
                    "<img class=\"card-img-top\" id="+ storyCardImageId+ "  src=" + dataR.input_image[0]+ " alt=\"Card_image_cap\" onclick=\"showModal(" + storyId + ")\" >";
                if (((dataR.input_image.length) - 1) !== 0)
                    storyCard += "<span id=\"photos_info\" class=\"plus_photos\"> "+ "&plus;" + (dataR.input_image.length - 1) + "</span>";
            }

            var storyText = dataR.story_text === undefined ? dataR.story_text : dataR.story_text.replace(/\r?\n/g, '<br />')

            storyCard +=
                "<div class=\"card-body border-top\">" +
                "<p class=\"card-text\">"+storyText+"</p>" +
                "</div>" +
                "<div class=\"card-footer text-muted\"> Rate Story: ";

            // rating stars
            for (var i = 0; i<5; i++) {
                var starId = "star" + (i+1);
                storyCard += "<i class = \"fa fa-star-o\" id="+starId+storyId+" onclick=\"handleRatingChange("+(i+1)+","+storyId+")\"></i>"
            }

            // undo rating button
            storyCard += "<a class='btn btn-sm text-white btn-danger pull-right' " +
                "id = 'undoRatingButton"+storyId+"' style='display:none' " +
                "onclick=\"handleRatingChange(0,"+storyId+")\"> Undo Rating</a>";

            storyCard += "<span id= \"averageRating"+storyId+"\" class='pl-2'>Average Rating: "+getAverageRating(storyId)+"</span></div>";

            row.innerHTML = storyCard;
        }
    }
}

/**
 * show a modal to display the story's images
 * if more than one image, images are displayed below of each other
 * @param storyId
 */
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

/**
 * close the modal
 */
function closeModal(){
    let modal = document.getElementById("modal");
    let close = document.getElementById("close_button");

    // When the user clicks (x), close the modal
    close.onclick = function() {
        modal.style.display = "none";
    }
}

/**
 * refresh the story list
 */
function refreshStoryList(){
    if (document.getElementById('storyResults')!=null)
        document.getElementById('storyResults').innerHTML='';
}

/**
 * search the stories
 * show the stories that include the text of the search in the text field
 */
function searchStories(){
    let searchValue = document.getElementById('search_text').value;
    let storyList = JSON.parse(localStorage.getItem('stories'));
    // check if stories exist
    if (storyList !== null){
        let ratingList = JSON.parse(localStorage.getItem('ratings'));
        // push the results to array
        let searchResults = [];
        storyList.forEach(function (story){
            let storyText = story.story_text;
            if (storyText.search(searchValue)>=0)
                searchResults.push(story);
        });

        // if results found show only the stories found
        if ((searchResults.length > 0) && (searchValue !== "")){
            //set the clear search button visible
            document.querySelector('#refreshButton').style.visibility = 'visible';
            document.querySelector('#refreshButton').style.display = 'inline';
            toggleGUIDisplay();
            retrieveAllStoryData(searchResults, ratingList);
        } else{
            if (searchValue == "")
                // no input text for search
                showMessage('error', "Please enter a text!", 3500);
            else
                // no stories found to match the search
                showMessage('error', "No results found!", 3500);
        }
    } else {
        // there are no stories
        showMessage('error', "There are no stories at the moment!", 3500)
    }

}

/**
 * add a story to the user's wall using the socket
 * user does not need to refresh the page to see a new story added by a user now
 */
if (document.cookie) {
    socket.on('refreshStories', function (storyInput) {
        var storyObj = JSON.parse(storyInput);
        var storyList = JSON.parse(localStorage.getItem('stories'));
        if (storyList == null) storyList = [];
        storyList.push(storyObj);

        localStorage.setItem('stories', JSON.stringify(storyList));
        storeStoryData(storyObj);
        var loggedInUser = document.cookie.split("=")[1];
        console.log(window.location.pathname)
        if (loggedInUser === storyObj.username || window.location.pathname === '/') {
            addStoryToResults(storyObj, true);
        }
    })
}
