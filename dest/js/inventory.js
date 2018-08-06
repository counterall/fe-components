jQuery(function ($) {
    "use strict"
    // Universal state store
    window.inventoryStatesStore = {
        debug: true,
        screen: {
            size:{
                mobile: false,
                tablet: false,
                desktop: true
            },
            touch: false
        },
        reservationForm: {
            reserveMsg: false,
            contact: false,
            storeId: false,
            qty: 1,
            currencyAhead: false,
            productName: '',
            productPrice: '',
            productCoverImg: ''
        },
        productParams: {
            sku: false
        },
        storeContactOverlay: false,
        selector: {
            size: false,
            city: false,
            qty: ['', 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
        },
        setScreen: function(key, val) {
            if (this.debug) {
                console.log("screen '" + key + "' is updated to value: ", val)
            }
            this.screen[key] = val;
        },
        setSelector: function (key, val) {
            if (this.debug) {
                console.log(key + " selector updated to value: ", val);
            }
            this.selector[key] = val;
        },
        setReserveAttrs: function (key, val) {
            if (this.debug) {
                console.log('Reservation form attr "' + key + '" is updated to ' + '"' + (val ? val : 'false') + '"');
            }
            this.reservationForm[key] = val;
        },
        setStoreContactOverlay: function (val) {
            if (this.debug) {
                console.log('Contact data for store contact overlay is updated!');
            }
            this.storeContactOverlay = val;
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
            this.screen.size.mobile = screenWidth < 768;
            this.screen.size.tablet = screenWidth < 1024 && screenWidth > 767;
            this.screen.size.desktop = !this.screen.size.mobile && !this.screen.size.tablet;
        },
        ajaxUrl: function() {
            return {
                host: window.location.origin + "/dest/json/inventory" + (this.productParams.type === 'onesize' ? "-onesize" : "") + ".json"
            };
        }
    };
    
    /* Create vue component of select element where select2 jQuery plugin is applied */
    Vue.component('vue-select2', {
        template: "#vue-select2-component",
        props: ['width', 'placeholder', 'label', 'options', 'htmlOptions', 'disableSearch', 'className', 'validate', 'errorMsg'],
        data: function() {
            return {
                config: {
                    placeholder: this.placeholder,
                    width: "resolve",
                    theme: "marimekko"
                },
                selected: false,
                selector: false
            };
        },
        methods: {
            destroySelect2: function() {
                if (this.selector.hasClass("select2-hidden-accessible")) {
                    this.selector.off('select2:open').select2('destroy');
                }
            },
            renderSelect2: function() {
                if (this.options.length) {
                    var vm = this;

                    if (!this.htmlOptions) {
                        var $optionEles = [];
                            $.each(this.options, function (i, v) {
                                var $optionEle = $('<option/>', {
                                    value: v,
                                    text: v
                                });
                                $optionEles.push($optionEle);
                            });
                        this.selector.empty().append($optionEles);  
                    } else {
                        this.selector.empty().append(this.options);
                    }

                    this.selector.on('change', function () {
                        /* validate value and emit vue change event*/
                        vm.checkSelectValidity();
                    });

                    if (!inventoryStatesStore.screen.touch) {
                        if (this.disableSearch) {
                            this.config.minimumResultsForSearch = Infinity;
                        }

                        if (this.width) {
                            this.selector.css('width', this.width);
                        }

                        this.config.dropdownParent = $('#' + this.dropDownWrapperId);
                        this.selector.select2(this.config);
    
                        if (this.label == 'size') {
                            this.colorSizeOptions();
                        }

                    }else{

                        this.selector.find('option').eq(0).text(this.config.placeholder);

                    }
                }
            },
            colorSizeOptions: function() {
                var vm = this;
                this.selector.on('select2:open', function (e) {
                    /* Check if all options are rendered ready */
                    var  renderedOptions = '#custom-' + vm.label+ '-select2-dropdown-wrapper .select2-container--marimekko .select2-results__option';
                    var $validOptions = vm.selector.find('option').map(function () {
                        if (this.value) {
                            return this;
                        }
                    });
                    var dfd = $.Deferred();
                    window.checkSelect2DropdownOpened = setInterval(() => {
                        if ($(renderedOptions).not(".loading-results").length == $validOptions.length) {
                            dfd.resolve();
                        }
                    }, 10);

                    dfd.done(function () {
                        clearInterval(window.checkSelect2DropdownOpened);
                        $validOptions.each(function(idx){
                            var color;
                            if ($(this).hasClass('size-option--green')) {
                                color = 'green';
                            }else if ($(this).hasClass('size-option--orange')) {
                                color = 'orange';
                            }else if ($(this).hasClass('size-option--red')) {
                                color = 'red';
                            }

                            $(renderedOptions).eq(idx).addClass(color);
                            
                        });
                    });
                })
            },
            checkSelectValidity: function() {
                if (typeof this.validate !== 'undefined' && this.validate) {
                    inputValidateHELPER.checkInputValidity(this.selector, "Please choose " + this.label);
                }
                this.$emit('change', this.selector.val());
            }
        },
        computed: {
            dropDownWrapperId: function() {
                return 'custom-' + this.label + '-select2-dropdown-wrapper';
            }
        },
        mounted: function () {
            this.selector = $(this.$el).find('select');
            this.renderSelect2();
        },
        watch: {
            options: function () {
                this.destroySelect2();
                this.renderSelect2();
            }
        },
        destroyed: function () {
            this.destroySelect2();
            console.log('"' + this.label + '" select is destroyed!');
        },
        created: function() {
            console.log('"' + this.label + '" select is created!');
        }
    });

    /* Create Vue component to show store list after related city is chosen */
    Vue.component('store-inventory-list', {
        props: ['storeName', 'contact', 'sizes', 'ownStore', 'countryCode', 'openingHours', "productMapping", "storeId", "storeType"],
        template: "#store-inventory-template",
        data: function(){
            return {
                oneSizeMapping: {
                    'FI': [null, "Varastossa", "Vähän jäljellä", "Loppuunmyyty"],
                    'EN': [null, "In stock", 'Few left', "Out of stock"]
                },
                productType: this.$root.statesStore.productParams.type
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
                if (this.ownStore && this.storeType != 1 && this.$root.rawProductData) {
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

                /* Not showing 'thank you' message content when initializing a reservation form popup */
                inventoryStatesStore.setReserveAttrs('reserveMsg', false);

                /* set contact info property for reservation form*/
                inventoryStatesStore.setReserveAttrs('contact', this.prepareContactDetail());
                
                /* set store ID for reservation form */
                inventoryStatesStore.setReserveAttrs('storeId', this.storeId);

                /* Set html content of product name and product price */
                inventoryStatesStore.setReserveAttrs('productName', $('.product-essential .product-name').html());
                inventoryStatesStore.setReserveAttrs('productPrice', $('.product-essential .price-box').html());

                /* Set product cover image url */
                inventoryStatesStore.setReserveAttrs('productCoverImg', $('.product-essential .product-images > li.product-image img')[0].src)
                
                /* Set size selector with sku of each size as the value of each size option */
                if (this.productType === 'sizable') {
                    var vm = this;
                    /* Empty size select*/
                    var $sizeOptions = [$("<option value=''></option>")];

                    $.each(this.sizes, function (idx, size) {
                        var $sizeOption = $('<option/>', {
                            'class': 'size-option'
                        });

                        // Define the html content of each option based on stock level
                        switch (size.level) {
                            case 1:
                                $sizeOption.addClass('size-option--green').html(size.product_size + " - varastossa");
                                break;
                            case 2:
                                $sizeOption.addClass('size-option--orange').html(size.product_size + " - vähän jäljellä");
                                break;
                            default:
                                $sizeOption.addClass('size-option--red').attr('disabled', 'disabled').html(size.product_size + " - loppuunmyyty");
                                break;
                        }

                        // Set value of each option, value is the Magento product ID of a simple product with chosen size
                        for (var key in vm.productMapping) {
                            
                            if (vm.productMapping.hasOwnProperty(key)) {
                            
                                if (vm.productMapping[key].size === size.product_size) {
                                    $sizeOption.attr('value', vm.productMapping[key].sku);
                                    break;
                                }
                                
                            }
                        }

                        $sizeOptions.push($sizeOption);

                    });

                    inventoryStatesStore.setSelector('size', $sizeOptions);

                }else {
                    var key = Object.keys(this.productMapping)[0];
                    inventoryStatesStore.setProductParams('sku', this.productMapping[key].sku);
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

    /* Create Vue component for Bootstrap modal */
    Vue.component('store-general-overlay', {
        props: ['modalId', 'modalTitle', 'showModal', 'centred'],
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
        },
        computed: {
            classObj: function() {
                return {
                  centred: this.centred || inventoryStatesStore.reservationForm.reserveMsg,
                  'message-wide': inventoryStatesStore.reservationForm.reserveMsg
                }
            }
        }
    });

    /* Create Vue component for store contact overlay */
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
        props: ['formData'],
        data: function() {
            return {
                productType: inventoryStatesStore.productParams.type,
                storeAttrs: inventoryStatesStore.storeAttrs
            };
        },
        template: "#reserve-product-template",
        mounted: function() {
            if (this.productType === 'onesize') {
                initQuantitySelector($(this.$el).find('.qty-selector-wrapper'));
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
        data: function () {
            return {
                fn: 'Kan',
                ln: 'Cong',
                tel: '0443213407',
                email: 'kcongmj23@gmail.com'
            };
        },
        template: "#reserve-form-template",
        methods: {
            /* Verify every input field given by user valid*/
            validateFormInput: function (evt) {
                var input = evt.target;
                inputValidateHELPER.checkInputValidity($(input), "Please enter a valid " + input.name);
            },
            checkReserveFormValidity: function () {
                var allPassed = true;
                var $failedInputs = $();
                var $form = $('#reserve-overlay');
                $form.find('input').each(function () {
                    if (!inputValidateHELPER.checkInputValidity($(this), "Please enter a valid " + this.name)) {
                        $failedInputs = $failedInputs.add($(this));
                        allPassed = false;
                    }
                });
                $form.find('select').each(function () {
                    if (!inputValidateHELPER.checkInputValidity($(this), "Please choose " + this.name)) {
                        $failedInputs = $failedInputs.add($(this));
                        allPassed = false;
                    }
                });

                /* Do POST request when all fields are valid */
                if (allPassed) {
                    var extraParams = {
                        firstname: this.fn,
                        lastname: this.ln,
                        telephone:this.tel,
                        email: this.email,
                        store_id: inventoryStatesStore.reservationForm.storeId,
                        sku: inventoryStatesStore.productParams.sku,
                        quantity: inventoryStatesStore.reservationForm.qty
                    };

                    console.log(extraParams);

                    $.ajax({
                        dataType: "json",
                        type: 'GET',
                        url: inventoryStatesStore.ajaxUrl().host,
                        data: extraParams
                    }).done(function (data) {
                        inventoryStatesStore.setReserveAttrs('reserveMsg', 'success');
                    }).fail(function () {
                        inventoryStatesStore.setReserveAttrs('reserveMsg', 'error');
                    });

                }else{
                    $failedInputs.eq(0).focus();
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
        props: ['product', 'summary'],
        template: "#reserve-summary-template",
        computed: {
            finalPrice: function() {
                var unitPrice = this.product.unitPrice;
                var totalPrice = parseInt(this.summary.qty) * unitPrice;
                return this.$root.formatPrice(totalPrice);
            },
            unitPrice: function() {
                var unitPrice = this.product.unitPrice;
                return this.$root.formatPrice(unitPrice);
            }
        },
        destroyed: function () {
            console.log('reserve summary destroyed!');
        },
        created: function () {
            console.log('reserve summary created!');
        },
        updated: function () {
            console.log('reserve summary updated!');
        },
        mounted: function () {
            if (this.product.type == 'onesize' && !$(this.$root.$el).find('select.qty-selector').val() && this.summary.qty > 1) {
                inventoryStatesStore.setReserveAttrs('qty', 1);
            }
            console.log('reserve summary mounted!');
        }
    });

    // root vue app
    window.inventoryApp = new Vue({
        el: "#inventory-app",
        data: {
            showDropdown: false,
            countryCode: "FI",
            countryData: false,
            cityData: false,
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
                       url: inventoryStatesStore.ajaxUrl().host,
                       data: extraParams
                   }).done(function (data) {
                       vm.countryData = data[vm.countryCode];
                       var cityList = Object.keys(vm.countryData).sort();
                       cityList.unshift('');
                       inventoryStatesStore.setSelector('city', cityList);
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
            },
            updateSku: function() {
                var $skuSelect = $('#reserve-overlay select.size-selector');
                var sku = $skuSelect.val();
                if (sku) {
                    inventoryStatesStore.setProductParams('sku', sku);
                }
            },
            updateQty: function () {
                var $qtySelect = $('#reserve-overlay select.qty-selector');
                var qty = parseInt($qtySelect.val());
                if (qty) {
                    inventoryStatesStore.setReserveAttrs('qty', qty);
                }
            },
            isTouchScreen: function() {
                // Check if a touch screen device
                if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
                    inventoryStatesStore.setScreen('touch', true);
                    return true;
                }else{
                    return false;
                }
            }

        },
        computed: {
            rawProductData: function() {
                var dataMine;
                if ($('ul.list-size > li').length > 1) {
                    dataMine = '.product-data-mine2';
                } else {
                    dataMine = '.product-data-mine3';
                }

                if (typeof $(dataMine).data('lookup') === 'string' && $(dataMine).data('lookup').length) {
                    return JSON.parse($(dataMine).data('lookup').replace(/'/g, '\"'));
                }else{
                    return false;
                }
            },
            productParams: function() {                
                var productMapping = {};
                if (this.rawProductData) {
                    for (var key in this.rawProductData) {
                        productMapping[key] = {};
                        productMapping[key].sku = this.rawProductData[key].sku; 
                        productMapping[key].size = this.rawProductData[key].size;
                    }
                }
                return {
                    product_mapping: productMapping
                };
            }
        },
        updated: function () {
            // console.log('App updated!');
        },
        mounted: function() {
            var bePassedParams = $(this.$el).data('product-params');
            bePassedParams.type = $('ul.list-size > li').length > 1 ? "sizable" : "onesize";
            
            if (this.rawProductData) {
               var productDataKey = Object.keys(this.rawProductData);
               bePassedParams.unitPrice = Number(this.rawProductData[productDataKey[0]].price_numeric);  
            }
           
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
                        inventoryStatesStore.setReserveAttrs('currencyAhead', true);
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
            bePassedParams.currency = currency;

            /* set screensize property when window is resized*/
            inventoryStatesStore.setScreenSize();
            var resizeTimeout;
            $(window).resize(function () {
                clearTimeout(resizeTimeout);
                resizeTimeout = setTimeout(function() {
                    inventoryStatesStore.setScreenSize();
                }, 50);
            });

            this.isTouchScreen();

            this.statesStore.productParams = Object.assign({}, this.statesStore.productParams, bePassedParams);
        }
    });

});