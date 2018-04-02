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
            clearInterval(window.checkSelect2DropdownOpened);

            // Make disabled original option selectable in select2-rendered dropdown
            $(disabledOpts).attr({
                "aria-disabled": false,
                "aria-selected": false
            }).addClass('select2-dummy-disabled');
        })
    });


})