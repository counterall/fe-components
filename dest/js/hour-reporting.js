    var beautifyTime = (digit) => digit < 10 ? ("0" + digit.toString()) : digit;
    if (!sessionStorage.timebase) {
      sessionStorage.setItem('timebase', Date.now());
    }

    var timeDiff = Math.floor((Date.now() - sessionStorage.timebase) / 1000);
    setInterval(() => {
      timeDiff++;
      var hour = beautifyTime(Math.floor(timeDiff / 3600));
      var min = beautifyTime(Math.floor(timeDiff % 3600 / 60));
      var sec = beautifyTime(timeDiff % 3600 % 60);
      $('#time').html(`${hour}:${min}:${sec}`);
    }, 1000);