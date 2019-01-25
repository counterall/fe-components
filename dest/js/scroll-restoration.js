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


/**
 * This manual solution fixing scrollRestoration issue is applied to 
 * browsers in Android, Windows and Mac. 
 * iOS natively handles scrolling mostly OK, so skip it.
 * Using patterns from https: //github.com/lancedikson/bowser to detect browser's metadata
 */
var browser = window.navigator.userAgent;

// Check OS platform then
var osDetected = {
  isWin: /Windows ((NT|XP)( \d\d?.\d)?)/i.test(browser),
  isMac: /mac os x (\d+(\.?_?\d+)+)/i.test(browser),
  isAndroid: !/like android/i.test(browser) && /android/i.test(browser),
  isiOS: /(ipod|iphone|ipad)/i.test(browser)
}

// iOS can be skipped as all main browsers works fine with scrollRestoration natively
if (!osDetected.isiOS) {
  var isFF = /firefox|iceweasel|fxios/i.test(browser);
  var isEdge = /edg([ea]|ios)/i.test(browser);
  var isChrome = /chrome|crios|crmo/i.test(browser);
  var isSafari = /safari|applewebkit/i.test(browser);
  var isSamsung = /SamsungBrowser/i.test(browser);

  var fixScroll = false;

  if (osDetected.isWin) {
    fixScroll = isFF;
  } else if (osDetected.isMac) {
    fixScroll = isFF || (!isChrome && isSafari);
  } else if (osDetected.isAndroid) {
    fixScroll = !(isEdge || isSamsung);
  }

  if (fixScroll) {
      console.log('let us fix!');
      // Turn off auto page position restoration
      ('scrollRestoration' in window.history) && (window.history.scrollRestoration = 'manual');

      // Scroll restoration after history entry has been accessed
      $(window).on('popState', function () {
        console.log('history entry accessed!', history.state);
        if (window.history.state) {
          var yPos = window.history.state.scrollY ? window.history.state.scrollY : 0;
          if (yPos) {
            var checkHeight = setInterval(function () {
              console.log(window.scrollY, yPos, $(document).height());
              if ($(document).height() >= yPos) {
                window.scrollTo(0, yPos);
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
              scrollY: window.scrollY
            }, 'save vertical scroll position', "");
          } else {
            window.history.pushState({
              scrollY: window.scrollY
            }, 'save vertical scroll position', "");
          }
        }
      }).on('load', function () {
        // Dislike Chrome, FF does not trigger popstate event after page loads, so we manualluy trigger it.
        $(this).trigger('popState');
      });
  }

}
