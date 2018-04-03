/*
 * A lib to add additional features of handling form validation, e.g. custom validation message
 */

window.validateHELPER = (function($) {

    var setCustomMsg = function ($container, msg) {
        var ele = $container[0];
        console.log(ele.validity);
        // set custom validation message if validation failed
        if (!ele.checkValidity()) {
            // ele.setCustomValidity("");

            $container.removeClass('mari-input--text-primary').addClass('mari-input--text-error');

            if (!$("+ .error-validation-msg", ele).length) {
                var $errorMsg = $('<div/>', {
                    "class": "error-validation-msg",
                    text: msg
                });
                $container.after($errorMsg);
            }
        }else{
            $("+ .error-validation-msg", ele).remove();
            $container.addClass('mari-input--text-primary').removeClass('mari-input--text-error');
        }

    };

    return {
        setCustomMsg: setCustomMsg
    };

})(jQuery);