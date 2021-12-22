const URL = "http://localhost:3000";

$(document).ready(() => {
    Handlebars.registerPartial("photo_comment", $("#photo_comment").html());
    loadPhotos();
    registerNextPrevEvents();

    registerCommentSubmitEvent();

});

async function registerCommentSubmitEvent() {
    let $commentForm = $("form");
    $commentForm.submit(event => {
        event.preventDefault();

        $.ajax({
            url: URL + "/comments/new",
            method: "POST",
            data: $commentForm.serialize(),
            success: function (res) {
                let commentTemplate = Handlebars.compile($("#photo_comments").html());
                let commentData = commentTemplate({ comments: [res] });
                $("#comments > ul").append(commentData);
                $commentForm.trigger("reset");
            }
        });
    });
}

function registerFavoriteEvent() {
    $("a.button.favorite").click(event => {
        event.preventDefault();
        let data = { photo_id: +event.target.dataset.id };
        $.ajax({
            url: URL + `/photos/favorite`,
            method: "POST",
            contentType: "application/json",
            data: JSON.stringify(data),
            success: function (res) {
                console.log("Successfully posted data");
                event.target.innerHTML = event.target.innerHTML.replace(/\d+/g, res.total);
            }
        });
    });
}

function registerLikeEvent() {
    $("a.button.like").click(event => {
        event.preventDefault();
        let data = { photo_id: +event.target.dataset.id };
        $.ajax({
            url: URL + `/photos/like`,
            method: "POST",
            contentType: "application/json",
            data: JSON.stringify(data),
            success: function (res) {
                console.log("Successfully posted data");
                event.target.innerHTML = event.target.innerHTML.replace(/\d+/g, res.total);
            }
        });
    });
}

function registerNextPrevEvents() {
    $(".prev").click(event => {
        event.preventDefault();
        let pictures = Array.prototype.slice.call($("#slides figure"));
        let lastPicture = pictures.pop();
        let $currentPicture = $(pictures[0]);

        $currentPicture.fadeOut();
        pictures.splice(0, 0, lastPicture);
        $(pictures[0]).fadeIn();
        pictures.forEach(picture => $("#slides").append(picture));

        $.ajax({
            url: URL + "/photos",
            success: function (data) {
                let index = +pictures[0].dataset.id - 1;
                renderPhotoInfo([data[index]]);
                renderComments(data, index);
                $("input[type='hidden']").attr("value", data[index].id);
            }
        });
    });


    $(".next").click(event => {
        event.preventDefault();
        let pictures = Array.prototype.slice.call($("#slides figure"));
        let currentPicture = pictures.shift();
        $(currentPicture).fadeOut();
        pictures.push(currentPicture);
        $(pictures[0]).fadeIn();

        pictures.forEach(picture => $("#slides").append(picture));

        $.ajax({
            url: URL + "/photos",
            success: function (data) {
                let index = +pictures[0].dataset.id - 1;
                renderPhotoInfo([data[index]]);
                renderComments(data, index);
                $("input[type='hidden']").attr("value", data[index].id);
            }
        });
    });
}

async function loadPhotos() {
    let rawPhotoData;

    await $.ajax({
        url: URL + "/photos",
        success: function (data) {
            rawPhotoData = data;
            renderPhotos(data);
            renderPhotoInfo(data);
        },
    });
    renderComments(rawPhotoData);
}

function renderComments(rawPhotoData, index = 0) {
    $.ajax({
        url: URL + `/comments?photo_id=${rawPhotoData[index].id}`,
        success: function (commentData) {
            let commentTemplate = Handlebars.compile($("#photo_comments").html());
            let allCommentData = commentTemplate({ comments: commentData });
            $("#comments > ul").html(allCommentData);
        }
    });
}

function renderPhotoInfo(data) {
    let photoInfoTemplate = Handlebars.compile($("#photo_information").html());
    let photoInfo = photoInfoTemplate(data[0]);
    $("section > header").html(photoInfo);

    registerLikeEvent();
    registerFavoriteEvent();
}

function renderPhotos(data) {
    let photosTemplate = Handlebars.compile($("#photos").html());
    let templateData = photosTemplate({ photos: data });
    $("#slides").html(templateData);
}

