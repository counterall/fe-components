    jQuery(($)=>{
      var beautifyTime = (digit) => digit < 10 ? ("0" + digit.toString()) : digit;
      if (!sessionStorage.timebase) {
        sessionStorage.setItem('timebase', Date.now());
      }

      var showTimer = () => {
        var timeDiff = Math.floor((Date.now() - sessionStorage.timebase) / 1000);
        var trackTime = setInterval(() => {
          timeDiff++;
          var hour = beautifyTime(Math.floor(timeDiff / 3600));
          var min = beautifyTime(Math.floor(timeDiff % 3600 / 60));
          var sec = beautifyTime(timeDiff % 3600 % 60);
          $('#time').html(`${hour}:${min}:${sec}`);
        }, 1000);
        return trackTime;
      }
      
      var timer = showTimer();
      var pauseTime = 0;
      $('#pause').on('click', function () {
        var newStatus = $(this).data('status') == 'play' ? "pause" : "play";
        $(this).data('status', newStatus);
        if ($(this).data('status') == 'play') {
          sessionStorage.timebase = parseInt(sessionStorage.timebase) + (Date.now() - sessionStorage.pauseTS);
          timer = showTimer();
          $(this).text('pause');
        }else {
          clearTimeout(timer);
          sessionStorage.pauseTS = Date.now();
          $(this).text('play');
        }
      });
    })
    