jQuery(function ($) {

    // Universal state store
    window.inventoryStatesStore = {
        debug: true,
        screensize: {
            mobile: false,
            tablet: false,
            desktop: true
        },
        overlay: {
            reserveMsg: false
        },
        productParams: {
            currencyAhead: false
        },
        storeContactInReserveForm: false,
        storeContactOverlay: false,
        setReserveMsg: function (val) {
            if (this.debug) {
                console.log('Reserve return message state updated to ' + '"' + (val ? val : 'false') + '"');
            }
            this.overlay.reserveMsg = val;
        },
        setStoreContactOverlay: function (val) {
            if (this.debug) {
                console.log('Contact data for store contact overlay is updated!');
            }
            this.storeContactOverlay = val;
        },
        setStoreContactInReserveForm: function (val) {
            if (this.debug) {
                console.log('Contact data for reservation is updated!');
            }
            this.storeContactInReserveForm = val;
        },
        setProductParams: function(key, val) {
            if (this.debug) {
                console.log(key + " updated to value: " + '"' + (val ? val : 'false') + '"');
            }
            this.productParams[key] = val;
        },
        setScreenSize: function() {
            var screenWidth = $('body').width();
            if (this.debug) {
                console.log("screen size has been updated to " + screenWidth + "!");
            }
            this.screensize.mobile = screenWidth < 768;
            this.screensize.tablet = screenWidth < 1024 && screenWidth > 767;
            this.screensize.desktop = !this.screensize.mobile && !this.screensize.tablet;
        },
        ajaxUrl: {
            host: "http://localhost:5500/dest/json/inventory-onesize.json"
        }
    }
    
    /* Create vue component of select element where select2 jQuery plugin is applied */
    Vue.component('city-select2', {
        props: ['options', 'value'],
        template: '<select>\
        <slot></slot>\
        </select>',
        mounted: function () {
            var vm = this;
            $(this.$el)
                // init select2
                .select2({
                    data: this.options,
                    placeholder: 'Valitse kaupunki',
                    width: "element",
                    theme: "marimekko"
                })
                // emit vue change
                .on('change', function () {
                    vm.$emit('change', this.value);
                });
        },
        watch: {
            value: function (value) {
                // update value
                $(this.$el).val(value);
            },
            options: function (options) {
                // update options
                $(this.$el).empty().select2({
                    data: options,
                    placeholder: 'Valitse kaupunki',
                    width: "element",
                    theme: "marimekko"
                });
            }
        },
        destroyed: function () {
            $(this.$el).off().select2('destroy');
        }
    });

    Vue.component('size-select2', {
        props: ['value'],
        template: '<select>\
        <slot></slot>\
        </select>',
        mounted: function () {
            var vm = this;
            $(this.$el)
                .select2({
                    placeholder: 'Valitse koko',
                    width: "element",
                    theme: "marimekko",
                    minimumResultsForSearch: Infinity,
                    dropdownParent: $('#custom-size-select2-dropdown-wrapper')
                })
                // emit vue change
                .on('change', function () {
                    vm.$emit('change', this.value);
                });
        },
        updated: function () {
            var vm = this;
            $(this.$el)
            .empty()
            .select2({
                placeholder: 'Valitse koko',
                width: "element",
                theme: "marimekko",
                minimumResultsForSearch: Infinity,
                dropdownParent: $('#custom-size-select2-dropdown-wrapper')
            })
            // emit vue change
            .on('change', function () {
                vm.$emit('change', this.value);
            });
        },
        watch: {
            value: function (value) {
                // update value
                $(this.$el).val(value);
            }
        },
        destroyed: function () {
            $(this.$el).off().select2('destroy');
        }
    });

    Vue.component('store-inventory-list', {
        props: ['storeName', 'contact', 'sizes', 'ownStore', 'countryCode', 'openingHours', "productMapping", "storeId", "storeType"],
        template: "#store-inventory-template",
        data: function(){
            return {
                oneSizeMapping: {
                    'FI': [null, "Varastossa", "Vähän jäljellä", "Loppuunmyyty"],
                    'EN': [null, "In stock", 'Few left', "Out of stock"]
                },
                productType: inventoryStatesStore.productParams.type
            };
        },
        computed: {
            locale: function(){
                if (this.countryCode === 'FI') {
                    return "FI";
                }else{
                    return "EN";
                }
            },
            hasInventory: function() {
                var validLevel = [1, 2];
                var hasInventory = false;
                if (this.ownStore && this.storeType != 1) {
                    $.each(this.sizes, function(idx, size) {
                        if (validLevel.indexOf(size.level) !== -1) {
                            hasInventory = true;
                            return false;
                        }
                    });
                }
                return hasInventory;
            }
        },
        methods: {
            getInventoryGroupClass: function (stock) {
                if (stock === 1) {
                    return "store-status-item--green";
                } else if (stock === 2) {
                    return "store-status-item--orange";
                } else {
                    return "store-status-item--red";
                }
            },
            prepareContactDetail: function(){
                var address = this.contact.address.split(',').map(function(ad){return ad.trim();});
                var contactInfo = {
                    name: this.storeName,
                    address: address,
                    openingHours: this.openingHours,
                    phone: this.contact.phone
                };
                return contactInfo;  
            },
            setContactFormOverlay: function (){
                /* set contact info property for contact overlay */
                inventoryStatesStore.setStoreContactOverlay(this.prepareContactDetail());
            },
            prepareReserveForm: function() {

                inventoryStatesStore.setReserveMsg(false);

                /* set contact info property for reservation form*/
                inventoryStatesStore.setStoreContactInReserveForm(this.prepareContactDetail());

                /* Attach storeID to the reservation form */
                $('.reserve-form--product > input.store-id').val(this.storeId);

                if (this.productType === 'sizable') {
                    var vm = this;
                    /* Empty size select*/
                    var $sizeSelect = $(this.$parent.$el).find('select.size-list');
                    $sizeSelect.empty().append("<option></option>");

                    $.each(this.sizes, function (idx, size) {
                        var $sizeOption = $('<option/>', {
                            'class': 'size-option'
                        });

                        // Define the html content of each option based on stock level
                        switch (size.level) {
                            case 1:
                                $sizeOption.addClass('size-option--green').html("<span>" + size.product_size + "</span> - varastossa");
                                break;
                            case 2:
                                $sizeOption.addClass('size-option--orange').html("<span>" + size.product_size + "</span> - vähän jäljellä");
                                break;
                            default:
                                $sizeOption.addClass('size-option--red').attr('disabled', 'disabled').html("<span>" + size.product_size + "</span> - loppuunmyyty");
                                break;
                        }

                        // Set value of each option, value is the Magento product ID of a simple product with chosen size
                        for (var key in vm.productMapping) {
                            
                            if (vm.productMapping.hasOwnProperty(key)) {
                            
                                if (vm.productMapping[key].size === size.product_size) {
                                    $sizeOption.attr('value', vm.productMapping[key].mag_id);
                                    break;
                                }
                                
                            }
                        }


                        $sizeSelect.append($sizeOption);
                    });
                }else {
                    $('.reserve-form .qty-selector .product-id').val(this.productMapping[69].mag_id);
                }

            }
        },
        mounted: function() {
            console.log('city mounted!');
        },
        updated: function () {
            console.log('city updated!');
        },
        destroyed: function () {
            console.log('city destroyed!');
        },
        created: function () {
            console.log('city created!');
        }
    });

    Vue.component('store-general-overlay', {
        props: ['modalId', 'modalTitle', 'showModal'],
        template: '#store-general-overlay',
        updated: function() {
            console.log($(this.$el).attr('id') + ' modal updated!');
        },
        watch: {
            showModal: function() {
                $(this.$el).modal();
            }
        },
        mounted: function() {
            $(this.$el).modal();
        }
    });

    Vue.component("store-contact", {
        props: ['storeContact'],
        template: "#store-contact-template",
        created: function () {
            console.log('store contact created!');
        },
        updated: function () {
            console.log('store contact updated!');
        },
        mounted: function () {
            console.log('store contact mounted!');
        }
    });

    /* Reserve & Collect Product Component */
    Vue.component("reserve-product-block", {
        props: ['storeContact'],
        data: function() {
            return {
                productType: inventoryStatesStore.productParams.type
            }
        },
        template: "#reserve-product-template",
        mounted: function() {
            if (this.productType === 'onesize') {
                initQuantitySelector($(this.$el).find('.qty-selector'));
            }
            console.log('reserve product mounted!');
        },
        destroyed: function () {
            console.log('reserve product destroyed!');
        },
        created: function () {
            console.log('reserve product created!');
        },
        updated: function () {
            console.log('reserve product updated!');
        },
    });

    /* Reserve & Collect Form Component */
    Vue.component("reserve-form-block", {
        template: "#reserve-form-template",
        data: function () {
            return {
                productType: inventoryStatesStore.productParams.type
            }
        },
        methods: {
            /* Verify every input field given by user valid*/
            validateFormInput: function (evt) {
                var input = evt.target;
                inputValidateHELPER.checkValidityAndSetCustomErrorMsg($(input), "Please enter a valid value");
            },
            checkReserveFormValidity: function () {
                var allPassed = true;
                var $form = $('#reserve-overlay');
                $form.find('input').each(function () {
                    if (!inputValidateHELPER.checkValidityAndSetCustomErrorMsg($(this), "Please enter a valid value")) {
                        allPassed = false;
                    }
                });

                /* Do POST request when all fields are valid */
                if (allPassed) {
                    var extraParams = {
                        firstname: $form.find('#reservation-fname').val(),
                        lastname: $form.find('#reservation-lname').val(),
                        telephone: $form.find('#reservation-phone').val(),
                        email: $form.find('#reservation-email').val(),
                        store_id: $form.find('input.store-id').val()
                    };

                    if (this.productType === 'sizable') {
                        extraParams.quantity = 1;
                        extraParams.product_id = $form.find('select.size-list').val();
                    } else {
                        extraParams.quantity = $form.find('input.qty-input').val();
                        extraParams.product_id = $form.find('input.product-id').val();
                    }

                    console.log(extraParams);
                    $.ajax({
                        dataType: "json",
                        type: 'GET',
                        url: inventoryStatesStore.ajaxUrl.host,
                        data: extraParams
                    }).done(function (data) {
                        inventoryStatesStore.setReserveMsg('success');
                    }).fail(function () {
                        inventoryStatesStore.setReserveMsg('error');
                    })

                }
            }
        },
        destroyed: function () {
            console.log('reserve form destroyed!');
        },
        created: function () {
            console.log('reserve form created!');
        },
        updated: function () {
            console.log('reserve form updated!');
        },
        mounted: function (){
            console.log('reserve form mounted!');
        }
    });

    /* Reserve & Collect Final Price Component */
    Vue.component("reserve-summary", {
        data: function() {
            return {
                qty: 1,
                currency: inventoryStatesStore.productParams.currency,
                currencyAhead: inventoryStatesStore.productParams.currencyAhead,
                productName: inventoryStatesStore.productParams.name,
                productType: inventoryStatesStore.productParams.type
            }
        },
        template: "#reserve-summary-template",
        computed: {
            finalPrice: function() {
                var unitPrice = inventoryStatesStore.productParams.unitPrice;
                var totalPrice = parseInt(this.qty) * unitPrice;
                return this.$root.formatPrice(totalPrice);
            },
            unitPrice: function() {
                var unitPrice = inventoryStatesStore.productParams.unitPrice;
                return this.$root.formatPrice(unitPrice);
            }
        },
        methods: {

        }
    });

    // root vue app
    window.inventoryApp = new Vue({
        el: "#inventory-app",
        data: {
            dropDownClass: "city-selector",
            showDropdown: false,
            countryCode: "FI",
            countryData: false,
            cityData: false,
            cityList: false,
            cityChosen: false,
            statesStore: inventoryStatesStore
        },
        methods: {
            toggleDropdown: function () {
                var extraParams = '';
                var vm = this;
                if (!this.countryData) {
                   $.get({
                       dataType: "json",
                       url: inventoryStatesStore.ajaxUrl.host,
                       data: extraParams
                   }).done(function (data) {
                       vm.countryData = data[vm.countryCode];
                       var cityList = Object.keys(vm.countryData).sort();
                       cityList.unshift('');
                       vm.cityList = cityList;
                   }).fail(function(){
                       vm.countryData = false;
                   });
                }
                this.showDropdown = !this.showDropdown;
            },
            switchList: function(city) {
              this.cityChosen = city;
              this.cityData = this.countryData[city];
            },
            formatPrice: function(price) {
                price = price.toFixed(2);
                if (this.countryCode == 'FI') {
                    price = price.replace('.', ',');
                }
                return price;
            }
        },
        computed: {
            productParams: function() {
                var rawProductData = JSON.parse($('.product-data-mine1').data('lookup').replace(/'/g, '\"'));
                var productMapping = {};
                for (var key in rawProductData) {
                    productMapping[key] = {};
                    productMapping[key].mag_id = rawProductData[key].id; 
                    productMapping[key].size = rawProductData[key].size;
                }
                
                return {
                    product_mapping: productMapping
                };
            }
        },
        updated: function () {
            console.log('App updated!');
        },
        mounted: function() {
            var bePassedParams = $(this.$el).data('product-params');

            inventoryStatesStore.productParams = Object.assign({}, inventoryStatesStore.productParams, bePassedParams)

            inventoryStatesStore.setProductParams('type', $('ul.list-size > li').length > 1 ? "sizable" : "onesize");

            var rawProductData = JSON.parse($('.product-data-mine1').data('lookup').replace(/'/g, '\"'));
            var productDataKey = Object.keys(rawProductData);
            inventoryStatesStore.setProductParams('unitPrice', Number(rawProductData[productDataKey[0]].price_numeric));

            var nonEuroCountries = ['US', 'AU', 'SE', 'UK', 'DK', 'NO'];
            var currency;
            if (nonEuroCountries.indexOf(this.countryCode) === -1) {
                currency = 'EUR';
            } else {
                switch (this.countryCode) {
                    case 'AU':
                        currency = 'AUD';
                        break;
                    case 'US':
                        currency = '$';
                        inventoryStatesStore.setProductParams('currencyAhead', true);
                        break;
                    case 'SE':
                        currency = 'SEK';
                        break;
                    case 'DK':
                        currency = 'DKK';
                        break;
                    case 'NO':
                        currency = 'NOK';
                        break;
                    case 'UK':
                        currency = 'GBP';
                        break;
                }
            }
            inventoryStatesStore.setProductParams('currency', currency);
            /* set screensize property when window is resized*/
            inventoryStatesStore.setScreenSize();
            var resizeTimeout;
            $(window).resize(function () {
                clearTimeout(resizeTimeout);
                resizeTimeout = setTimeout(function() {
                    inventoryStatesStore.setScreenSize();
                }, 50);
            });

        }
    });

});