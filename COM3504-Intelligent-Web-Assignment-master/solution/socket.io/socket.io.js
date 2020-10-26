exports.init = function (io, app) {
    io.sockets.on('connection', function (socket) {
        console.log("socket connected!");
        socket.on('new_story', function (storyInput) {
            console.log("received new story" + storyInput);
            socket.broadcast.emit('refreshStories', storyInput);
        });
        socket.on('new_rating', function (ratingInput) {
            console.log("received new rating" + ratingInput);
            socket.broadcast.emit('refreshRatings', ratingInput);
        })
    })
}

