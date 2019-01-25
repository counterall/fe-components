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
var usrAgent = window.navigator.userAgent;

// Check OS platform first
var browser = {
  os: {
    isWin: /Windows ((NT|XP)( \d\d?.\d)?)/i.test(usrAgent),
    isMac: /mac os x (\d+(\.?_?\d+)+)/i.test(usrAgent),
    isAndroid: !/like android/i.test(usrAgent) && /android/i.test(usrAgent),
    isiOS: /(ipod|iphone|ipad)/i.test(usrAgent)
  }
}

// iOS can be skipped as all main browsers work mostly fine with scrollRestoration natively
if (!browser.os.isiOS) {
  browser.type = {
    isFF: /firefox|iceweasel|fxios/i.test(usrAgent),
    isEdge: /edg([ea]|ios)/i.test(usrAgent),
    isChrome: /chrome|crios|crmo/i.test(usrAgent),
    isSafari: /safari|applewebkit/i.test(usrAgent),
    isSamsung: /SamsungBrowser/i.test(usrAgent)
  };
  
  var fixScroll = false;

  if (browser.os.isWin) {
    fixScroll = browser.type.isFF;
  } else if (browser.os.isMac) {
    fixScroll = browser.type.isFF || (!browser.type.isChrome && browser.type.isSafari);
  } else if (browser.os.isAndroid) {
    fixScroll = !(browser.type.isEdge || browser.type.isSamsung);
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
