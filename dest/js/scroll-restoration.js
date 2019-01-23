jQuery(function ($) {
    var $floatPos = $("<div/>", {
        "class": 'float-pos'
    }).css({
        "position": "fixed",
        "top": "50%",
        "left": "50%",
        "transform": "translate(-50%, -50%)",
        "font-size": "150px",
        "line-height": "150px",
        "background-color": "black",
        "opacity": "0.8",
        "color": "crimson",
        "z-index": 999
    }).text(window.scrollY);

    $floatPos.prependTo($('body'));
    $(window).on('scroll', function () {
        $('.float-pos').text(window.scrollY);
    });
});

// For non-chrome browsers
if (/firefox|safari/i.test(window.navigator.userAgent)) {

    // Turn off auto page position restoration
    ('scrollRestoration' in window.history) && (window.history.scrollRestoration = 'manual');

    // scroll restoration after history entry has been accessed
    $(window).on('popState', function () {
        console.log('history entry accessed!', history.state);
        if (window.history.state) {
            var xPos = window.history.state.scrollX ? window.history.state.scrollX : 0;
            var yPos = window.history.state.scrollY ? window.history.state.scrollY : 0;
            if (yPos) {
                var checkHeight = setInterval(function () {
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
        if (window.history.pushState) {
            if (window.history.state) {
                window.history.replaceState({
                    scrollY: window.scrollY,
                    scrollX: window.scrollX
                }, 'save scroll position', "");
            } else {
                window.history.pushState({
                    scrollY: window.scrollY,
                    scrollX: window.scrollX
                }, 'save scroll position', "");
            }
        }
    }).on('load', function () {
        $(this).trigger('popState');
    });
}