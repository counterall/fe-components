jQuery(function($) {
    $.ajax({
        dataType: "json",
        type: 'GET',
        url: window.location.origin + "/dest/json/scroll-location.json"
    }).done(function (data) {
        var $wrapper = $('.wrapper');
        var imgNames = data['cover-name'];
        for (var index = 0; index < 51; index++) {
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

// FOR non-chrome browsers
if (!/chrome/i.test(window.navigator.userAgent)) {
    // Turn off auto page position restoration
    ('scrollRestoration' in window.history) && (window.history.scrollRestoration = 'manual');

    // scroll restoration after history entry has been accessed
    $(window).on('popState', function () {
        console.log('history entry accessed!', window.scrollY);
        if (window.history.state) {
            var xPos = window.history.state.scrollX ? window.history.state.scrollX : 0;
            var yPos = window.history.state.scrollY ? window.history.state.scrollY : 0;
            if (yPos) {
                var checkHeight = setInterval(() => {
                    console.log(window.scrollY, yPos, $(document).height());
                    if ($(document).height() >= yPos) {
                        window.scrollTo(xPos, yPos);
                        clearInterval(checkHeight);
                    }
                }, 100);
            }
            
        }
    });

    // Mark location before page unloads
    $(window).on('beforeunload', function () {
        history.pushState({
            scrollY: window.scrollY,
            scrollX: window.scrollX
        }, 'cateogry page', "");
    }).on('load', function() {
        $(this).trigger('popState');
    }).on('scroll', function(){console.log(window.scrollY);});
}