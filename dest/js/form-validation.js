/*
 * A lib to add additional features of handling form validation, e.g. custom validation message
 */

window.inputValidateHELPER = (function($) {
    var doValidation = function(ele, $msgBeforeContainer, msg) {

        // set custom validation message if validation failed
        if (!ele.checkValidity()) {

            $msgBeforeContainer.removeClass('mari-input--text-primary').addClass('mari-input--text-error');

            if (!$("+ .error-validation-msg", ele).length) {
                var $errorMsg = $('<div/>', {
                    "class": "error-validation-msg",
                    text: msg
                });
                $msgBeforeContainer.after($errorMsg);
            }

            return false;

        } else {

            $("+ .error-validation-msg", ele).remove();
            $msgBeforeContainer.addClass('mari-input--text-primary').removeClass('mari-input--text-error');
            return true;

        }

    };

    var checkInputValidity = function ($container, msg) {
        var ele = $container[0];

        /* when select2 widget is used to render the original select*/
        var $selectContainer = $container.next('.select2-container');
        if ($selectContainer.length) {
            $container = $selectContainer;
        }
        
        return doValidation(ele, $container, msg);
    };

    var realtimeTextInputValidate = function($container){

        $container.removeClass('mari-input--text-primary');
        var ele = $container[0];
        if (!ele.checkValidity()) {
            $container.removeClass('mari-input--text-success').addClass('mari-input--text-error');
        } else {
            $container.addClass('mari-input--text-success').removeClass('mari-input--text-error');
            $("+ .error-validation-msg", ele).remove();
        }

    };

    return {
        checkInputValidity: checkInputValidity,
        realtimeTextInputValidate: realtimeTextInputValidate
    };

})(jQuery);