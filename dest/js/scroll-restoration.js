jQuery(function($) {
    $.ajax({
        dataType: "json",
        type: 'GET',
        url: window.location.origin + "/dest/json/scroll-location.json"
    }).done(function (data) {
        const $wrapper = $('.wrapper');
        const imgNames = data['cover-name'];
        for (let index = 0; index < 50; index++) {
           let randomID = Math.floor(Math.random() * 4);
           let imgName = `dest/img/${imgNames[randomID]}.jpg`;
           let $link = $('<a/>', {
               'class': 'cover-wrapper',
               href: 'inventory.html'
           });
           let $imgEle = $('<img/>', {
               src: imgName,
               'class': 'cover'
           });
           $imgEle.appendTo($link);
           $link.appendTo($wrapper);
        }

    }).fail(function () {
        
    });
});