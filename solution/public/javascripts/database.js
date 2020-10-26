const SOCIAL_MEDIA_DB_NAME= 'db_social_media';

const STORIES_STORE_NAME= 'store_stories';
const USERS_STORE_NAME = 'store_users';
const RATINGS_STORE_NAME = 'store_ratings';
const LOGIN_STORE_NAME = 'store_login';
var dbPromise;

/**
 * it inits the database
 */
function initDatabase() {
    //open database, create the object store ('table') and create the indexes ('fields')
    dbPromise = idb.openDb(SOCIAL_MEDIA_DB_NAME, 1, function (upgradeDb) {
        if (!upgradeDb.objectStoreNames.contains(LOGIN_STORE_NAME)) {
            var loginOS = upgradeDb.createObjectStore(LOGIN_STORE_NAME, {keyPath: 'username'});
            loginOS.createIndex('username', 'username', {unique: true, multiEntry: false});
            loginOS.createIndex('password', 'password', {unique: false, multiEntry: false});
        }
        if (!upgradeDb.objectStoreNames.contains(USERS_STORE_NAME)) {
            var usersOS = upgradeDb.createObjectStore(USERS_STORE_NAME, {keyPath: 'username'});
            usersOS.createIndex('username', 'username', {unique: false, multiEntry: true});
            usersOS.createIndex('first_name', 'first_name', {unique: false, multiEntry: true});
            usersOS.createIndex('last_name', 'last_name', {unique: false, multiEntry: true});
        }
        if (!upgradeDb.objectStoreNames.contains(STORIES_STORE_NAME)) {
            var storiesOS = upgradeDb.createObjectStore(STORIES_STORE_NAME, {keyPath: 'story_id'});
            storiesOS.createIndex('story_id', 'story_id', {unique: true, multiEntry: false});
            storiesOS.createIndex('username', 'username', {unique: false, multiEntry: false});
            storiesOS.createIndex('story_date', 'story_date', {unique: false, multiEntry: false});
            storiesOS.createIndex('story_text', 'story_text', {unique: false, multiEntry: false});
            storiesOS.createIndex('input_image', 'input_image', {unique: false, multiEntry: false});

            // add the other field later e.g pictures
        }
        if (!upgradeDb.objectStoreNames.contains(RATINGS_STORE_NAME)) {
            var ratingsOS = upgradeDb.createObjectStore(RATINGS_STORE_NAME, {keyPath: 'story_id'});
            ratingsOS.createIndex('story_id', 'story_id', {unique: false, multiEntry: false});
            ratingsOS.createIndex('username', 'username', {unique: false, multiEntry: false});
            ratingsOS.createIndex('vote', 'vote', {unique: false, multiEntry: false});
            ratingsOS.createIndex('rating_date', 'rating_date', {unique: false, multiEntry: false});
        }
    });
}

/**
 * it retrieves the forecasts data for a city from the database
 * @returns {*}
 * @param loginObject
 */

function getLoginData(loginObject) {
    dbPromise = idb.openDb(SOCIAL_MEDIA_DB_NAME, 1);
    if (dbPromise) {
        dbPromise.then(function (db) {
            // console.log('fetching: '+ loginObject);
            var tx = db.transaction(LOGIN_STORE_NAME, 'readonly');
            var store = tx.objectStore(LOGIN_STORE_NAME);
            var index = store.index('username');
            return index.get(IDBKeyRange.only(loginObject.username));
        }).then(function (foundObject) {
            if (foundObject) {
                if (foundObject.username === loginObject.username && foundObject.password === loginObject.password) {
                    document.location.href = '/';
                    document.cookie = "username=" + foundObject.username;
                } else {
                    showMessage('error', 'Username/Password incorrect. Please try again');
                }
            } else{
                showMessage('error', 'Username/Password incorrect. Please try again');
            }
        });
    } else{
        console.log("no promise");
    }
}


function checkRegisterData(registerObject) {
    dbPromise = idb.openDb(SOCIAL_MEDIA_DB_NAME, 1);
    if (dbPromise) {
        dbPromise.then(function (db) {
            // console.log('fetching: '+ loginObject);
            var tx = db.transaction(LOGIN_STORE_NAME, 'readonly');
            var store = tx.objectStore(LOGIN_STORE_NAME);
            var index = store.index('username');
            return index.get(IDBKeyRange.only(registerObject.username));
        }).then(function (foundObject) {
            console.log(foundObject);
            if (foundObject) {
                if (foundObject.username === registerObject.username) {
                    showMessage('error', 'Username already exists. Please try using a different username.');
                }
            } else if (registerObject.password !== registerObject.confirm_password){
                showMessage('error', 'Passwords do not match. Please try again.');
            } else {
                //add function here to add to the database
                storeUserLoginData(registerObject);
                document.location.href = '/login'
            }
        });
    } else{
        console.log("no promise");
    }
}

function storeUserLoginData(userObject) {
    dbPromise = idb.openDb(SOCIAL_MEDIA_DB_NAME, 1);
    if (dbPromise) {
        dbPromise.then(function (db) {
            var login_transaction = db.transaction(LOGIN_STORE_NAME, 'readwrite');
            var loginUser = {username: userObject.username, password: userObject.password};
            var storeLoginObject = login_transaction.objectStore(LOGIN_STORE_NAME);
            storeLoginObject.add(loginUser);
            //setItemLocalStorage(USERS_STORE_NAME, user);
            console.log('Storing login User: ', loginUser);

        });

    }
}

function storeStoryData(storyObject) {
    console.log("storeStoryData", storyObject);
    dbPromise = idb.openDb(SOCIAL_MEDIA_DB_NAME, 1);
    if (dbPromise) {
        dbPromise.then(function (db) {
            var story_transaction = db.transaction(STORIES_STORE_NAME, 'readwrite');
            //var story = {username: storyObject.username, story_date: storyObject.story_date, story_text: storyObject.story_text, input_image: storyObject.input_image };
            var storeStoryObject = story_transaction.objectStore(STORIES_STORE_NAME);
            storeStoryObject.add(storyObject);
            showMessage('success', 'Story posted!', 2500);
        });

    }
}

function storeRatingData(ratingObject) {
    dbPromise = idb.openDb(SOCIAL_MEDIA_DB_NAME, 1);
    if (dbPromise) {
        dbPromise.then(function (db) {
            var rating_transaction = db.transaction(RATINGS_STORE_NAME, 'readwrite');
            var storeRatingObject = rating_transaction.objectStore(RATINGS_STORE_NAME);
            storeRatingObject.put(ratingObject);
        });

    }

    hideMessage();

}







