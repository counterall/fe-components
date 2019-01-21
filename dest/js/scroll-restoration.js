jQuery(function($) {
    $.ajax({
        dataType: "json",
        type: 'GET',
        url: window.location.origin + "/dest/json/scroll-location.json"
    }).done(function (data) {
        var $wrapper = $('.wrapper');
        var imgNames = data['cover-name'];
        for (var index = 0; index < 50; index++) {
           var randomID = Math.floor(Math.random() * 4);
           var imgName = "dest/img/" + imgNames[randomID] + '.jpg';
           var $link = $('<a/>', {
               'class': 'cover-wrapper',
               href: 'inventory.html'
           });
           var $imgEle = $('<img/>', {
               src: imgName,
               'class': 'cover'
           });
           $imgEle.appendTo($link);
           $link.appendTo($wrapper);
        }

    }).fail(function () {
        
    });
});