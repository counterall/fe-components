/*
 * A lib to add additional features of handling form validation, e.g. custom validation message
 */

window.inputValidateHELPER = (function($) {

    var checkValidityAndSetCustomErrorMsg = function ($container, msg) {
        var ele = $container[0];
        console.log(ele.validity);

        // set custom validation message if validation failed
        if (!ele.checkValidity()) {

            $container.removeClass('mari-input--text-primary').addClass('mari-input--text-error');

            if (!$("+ .error-validation-msg", ele).length) {
                var $errorMsg = $('<div/>', {
                    "class": "error-validation-msg",
                    text: msg
                });
                $container.after($errorMsg);
            }

            return false;

        }else{

            $("+ .error-validation-msg", ele).remove();
            $container.addClass('mari-input--text-primary').removeClass('mari-input--text-error');
            return true;

        }

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
        checkValidityAndSetCustomErrorMsg: checkValidityAndSetCustomErrorMsg,
        realtimeTextInputValidate: realtimeTextInputValidate
    };

})(jQuery);