function initQuantitySelector($selector){
    
    var $descrease = $selector.find('.qty-minus');
    var $inscrease = $selector.find('.qty-plus');
    var $input = $selector.find('input.qty-input');
    var $displayedVal = $selector.find('.qty-val');
    /* by default, max is 10 and min is 1 */
    var maxVal = $input.attr('max') ? $input.attr('max') : 10;
    var minVal = $input.attr('min') ? $input.attr('min') : 1;

    $descrease.on('click', function() {
        var currentVal = parseInt($input.val());
        var newVal = currentVal - 1 >= minVal ? currentVal - 1 : minVal;
        if (newVal !== currentVal) {
            $input.val(newVal);
            $displayedVal.text(newVal);
        }
    })

    $inscrease.on('click', function () {
        var currentVal = parseInt($input.val());
        var newVal = currentVal + 1 <= maxVal ? currentVal + 1 : maxVal;
        if (newVal !== currentVal) {
            $input.val(newVal);
            $displayedVal.text(newVal);
        }
    })

}