/*
 * A lib to add additional features of processing product data on product page
 */

window.productDataHelper = (function ($) {

    var parseProductData = function ($dataMineContainer) {

        var lookupMalformedJSON = $dataMineContainer.data('lookup');
        var JSONLookup = lookupMalformedJSON.replace(/'/g, '\"');

        return JSON.parse(JSONLookup);

    };

    var getProductID = function ($dataMineContainer, attrVal) {
        return parseProductData($dataMineContainer)[attrVal].id;
    };

    return {
        getProductID: getProductID,
    };

})(jQuery);