jQuery(function ($) {
    var select2Options = {
        width: "element",
        theme: "marimekko",
        minimumResultsForSearch: Infinity,
        dropdownParent: $('.custom-select2-dropdown-wrapper')
    };

    $('.select2fied').select2(select2Options);

    var $select2Rendered = $('select.list-size + .select2 .select2-selection__rendered');
    
    $('.select2fied').on('select2:open', function (e) {
        var disabledOpts = '.custom-select2-dropdown-wrapper .select2-container--marimekko .select2-results__option[aria-disabled=true]';

        var dfd = $.Deferred();
        window.checkSelect2DropdownOpened = setInterval(() => {
            if ($(disabledOpts).not(".loading-results").length == $('option[disabled]', this).length) {
                dfd.resolve();
            }
        }, 10);
        dfd.done(function(){
            $(disabledOpts).attr("aria-disabled", false).css({
                "user-select": "initial",
                "cursor": "pointer"
            });
            clearInterval(window.checkSelect2DropdownOpened);
            $(disabledOpts).off('click').on('click', function () {
                var optVal = $(this).text();
                $select2Rendered.text(optVal);
                $('.custom-select2-dropdown-wrapper').html('');
                console.log($('select.list-size').val());
            });
        })
    });


})