jQuery(function ($) {
    
    // Select2fy the size dropdown
    var select2Options = {
        width: "element",
        theme: "marimekko",
        minimumResultsForSearch: Infinity,
        dropdownParent: $('.custom-select2-dropdown-wrapper')
    };

    $('.select2fied').select2(select2Options);

    // prepare variables
    var $select2Rendered = $('select.list-size + .select2 .select2-selection__rendered');
    var $emailInput = $('input.product-alert-email'); 
    var $alertBlock = $(".product-alert");
    var $triggerBtn = $('.product-alert-trigger');
    var $addToCartBlock = $('.product-options-bottom');
    var $popupModal = $alertBlock.find('.modal');
    var sizeVal = false; 
    
    // Make originally disabled option selectable in select2fied dropdown representation
    $('.select2fied.list-size').on('select2:open', function (e) {
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
    }).on('select2:select', function (e) {
        // When a select2 option is chosen, show email-me block and hide 'add to cart' block
        var $optionChosen = $(e.params.data.element);
        if ($optionChosen.prop('disabled')) {
            $select2Rendered.addClass('disabled-option-selected');
            $triggerBtn.prop('disabled', false).addClass('mari-btn-primary').removeClass('mari-btn-inactive');
            sizeVal = $optionChosen.data('optionid');
            $alertBlock.show();
            $addToCartBlock.hide();
        } else {
            $select2Rendered.removeClass('disabled-option-selected');
            sizeVal = false;
            $alertBlock.hide();
            $addToCartBlock.show();
        }
    });

    // Check email input validity once it loses focus
    $emailInput.on('keyup', function(){
        validateHELPER.textInputValidate($(this));
    });

    //If email input is valid, then do ajax call to subscribe the notification
    $triggerBtn.on('click', function(){
        
        var validated = validateHELPER.checkValidityAndSetCustomErrorMsg($emailInput, "Please enter a valid email address");
        console.log(validated);

        if (validated) {
            
            if (!sizeVal) {
                console.log('No size is chosen to subscribe email!');
                return false;
            }

            $emailInput.removeClass('mari-input--text-success').addClass('mari-input--text-primary');
            $(this).prop('disabled', true).addClass('mari-btn-inactive').removeClass('mari-btn-primary');
            
            var email = $emailInput.val();
            var productID = productDataHelper.getProductID($('.product-data-mine'), sizeVal);
            var extraParams = {
                email: email,
                product_id: productID
            };

            $.ajax({
                type: "GET",
                dataType: "json",
                url: "http://localhost:5500/dest/json/add-alert.json",
                data: $.param(extraParams)
            }).done(function (data) {

                $popupModal.find('.modal-content-success').show();
                $popupModal.find('.modal-content-error').hide();

            }).fail(function () {
                
                $popupModal.find('.modal-content-success').hide();
                $popupModal.find('.modal-content-error').show();
                $triggerBtn.prop('disabled', false).addClass('mari-btn-primary').removeClass('mari-btn-inactive');   

            }).always(function(){
                $popupModal.modal();
            });

        }

    })

})