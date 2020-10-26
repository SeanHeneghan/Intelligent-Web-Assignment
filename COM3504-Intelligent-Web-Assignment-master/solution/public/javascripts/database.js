const SOCIAL_MEDIA_DB_NAME= 'db_social_media';
const STORIES_STORE_NAME= 'store_stories';
const RATINGS_STORE_NAME = 'store_ratings';
var dbPromise;

/**
 * it inits the database
 */
function initDatabase() {
    dbPromise = idb.openDb(SOCIAL_MEDIA_DB_NAME, 1, function (upgradeDb) {
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
            var ratingsOS = upgradeDb.createObjectStore(RATINGS_STORE_NAME, {keyPath: 'rating_id'});
            ratingsOS.createIndex('rating_id', 'rating_id', {unique: true, multiEntry: false});
            ratingsOS.createIndex('story_id', 'story_id', {unique: false, multiEntry: false});
            ratingsOS.createIndex('username', 'username', {unique: false, multiEntry: false});
            ratingsOS.createIndex('vote', 'vote', {unique: false, multiEntry: false});
            ratingsOS.createIndex('rating_date', 'rating_date', {unique: false, multiEntry: false});
        }
    });
}

/**
 * stores a new story in the database
 * @param storyObject
 */
function storeStoryData(storyObject) {
    dbPromise = idb.openDb(SOCIAL_MEDIA_DB_NAME, 1);
    if (dbPromise) {
        dbPromise.then(function (db) {
            var story_transaction = db.transaction(STORIES_STORE_NAME, 'readwrite');
            var storeStoryObject = story_transaction.objectStore(STORIES_STORE_NAME);
            storeStoryObject.add(storyObject);
        });

    }
}

/**
 * stores/updates a new rating
 * deletes rating if undo rating is pressed
 * @param ratingObject
 */
function storeRatingData(ratingObject) {
    dbPromise = idb.openDb(SOCIAL_MEDIA_DB_NAME, 1);
    if (dbPromise) {
        dbPromise.then(function (db) {
            var rating_transaction = db.transaction(RATINGS_STORE_NAME, 'readwrite');
            var storeRatingObject = rating_transaction.objectStore(RATINGS_STORE_NAME);

            // adapt date for indexed
            ratingObject.rating_date = ratingObject.vote_date;
            delete ratingObject.vote_date;

            // delete rating
            if (ratingObject.vote === 0) {
                storeRatingObject.delete(ratingObject.rating_id);
            } else {
                storeRatingObject.put(ratingObject);
            }
        });

    }

    hideMessage();
}

/**
 * clears the database
 * @returns {Promise<void>}
 */
async function clearRecords() {
    dbPromise = idb.openDb(SOCIAL_MEDIA_DB_NAME, 1);
    if (dbPromise) {
        dbPromise.then(function (db) {
            var rating_transaction = db.transaction(RATINGS_STORE_NAME, 'readwrite');
            var story_transaction = db.transaction(STORIES_STORE_NAME, 'readwrite');
            var ratingObjectStore = rating_transaction.objectStore(RATINGS_STORE_NAME);
            var storyObjectStore = story_transaction.objectStore(STORIES_STORE_NAME);
            ratingObjectStore.clear();
            storyObjectStore.clear();
        });

    }
}

/**
 * syncs with mongo
 * takes stories from mongo and adds to localStorage
 * @param data
 */
function storeMongoStories(data) {
    localStorage.setItem('lastStoryUpdate', JSON.stringify(Date.now()));
    var storyData = data;

    if (storyData.length === 0)
        return;

    storyData.forEach((story) => {
        story.story_date = new Date(story.story_date).getTime();
        delete story._id;
    });

    localStorage.setItem('stories', JSON.stringify(storyData));
    storyData.forEach((story) => {
        storeStoryData(story);
    });
}

/**
 * syncs with mongo
 * takes ratings from mongo and adds to localStorage
 * @param data
 */
function storeMongoRatings(data) {
    localStorage.setItem('lastRatingUpdate', JSON.stringify(Date.now()));
    var ratingData = data;

    if (ratingData.length === 0)
        return;

    ratingData.forEach((rating) => {
        rating.rating_id = rating.story_id + rating.username
        rating.rating_date = (new Date(rating.vote_date)).getTime();
        delete rating._id;
        delete rating.vote_date;

    });

    localStorage.setItem('ratings', JSON.stringify(ratingData));

    ratingData.forEach((rating) => {
        storeRatingData(rating);
    });
}








