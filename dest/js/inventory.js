jQuery(function ($) {

    // Universal state store
    window.inventoryStatesStore = {
        debug: true,
        screensize: {
            mobile: false,
            tablet: false,
            desktop: true
        },
        reservationForm: {
            reserveMsg: false,
            contact: false,
            storeId: false,
            sku: false         
        },
        productParams: {
            currencyAhead: false,
            qty: 1
        },
        storeContactOverlay: false,
        selector: {
            size: false,
            city: false
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
            this.screensize.mobile = screenWidth < 768;
            this.screensize.tablet = screenWidth < 1024 && screenWidth > 767;
            this.screensize.desktop = !this.screensize.mobile && !this.screensize.tablet;
        },
        ajaxUrl: {
            host: "http://localhost:5500/dest/json/inventory.json"
        }
    };
    
    /* Create vue component of select element where select2 jQuery plugin is applied */
    Vue.component('vue-select2', {
        template: "#vue-select2-component",
        props: ['width', 'placeholder', 'label', 'options', 'htmlOptions', 'disableSearch', 'className'],
        data: function() {
            return {
                config: {
                    placeholder: this.placeholder,
                    width: "resolve",
                    theme: "marimekko"
                }
            };
        },
        methods: {
            renderSelect2: function() {
                if (!this.htmlOptions) {
                    this.config.data = this.options;
                } else {
                    $(this.$el).find('select').empty().append(this.options);
                }

                if (this.disableSearch) {
                    this.config.minimumResultsForSearch = Infinity;
                }

                if (this.width) {
                    $(this.$el).find('select').css('width', this.width);
                }

                this.config.dropdownParent = $('#' + this.dropDownWrapperId);
                var vm = this;
                $(this.$el).find('select')
                .select2(this.config)
                // emit vue change
                .on('change', function () {
                    vm.$emit('change', this.value);
                });
            }
        },
        computed: {
            dropDownWrapperId: function() {
                return 'custom-' + this.label + '-select2-dropdown-wrapper';
            }
        },
        mounted: function () {
            this.renderSelect2();
        },
        watch: {
            options: function () {
                $(this.$el).find('select').off().select2('destroy');
                this.renderSelect2();
            }
        },
        destroyed: function () {
            $(this.$el).find('select').off().select2('destroy');
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

                inventoryStatesStore.setReserveAttrs('reserveMsg', false);

                /* set contact info property for reservation form*/
                inventoryStatesStore.setReserveAttrs('contact', this.prepareContactDetail());
                
                /* set store ID for reservation form */
                inventoryStatesStore.setReserveAttrs('storeId', this.storeId);

                if (this.productType === 'sizable') {
                    var vm = this;
                    /* Empty size select*/
                    var $sizeOptions = [$("<option></option>")];

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
                    inventoryStatesStore.setReserveAttrs('sku', this.productMapping[key].sku);
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
                productType: inventoryStatesStore.productParams.type,
                storeAttrs: inventoryStatesStore.storeAttrs
            };
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
        props: ['isMobile'],
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
                inputValidateHELPER.checkInputValidity($(input), "Please enter a valid value");
            },
            checkReserveFormValidity: function () {
                var allPassed = true;
                var $form = $('#reserve-overlay');
                $form.find('input').each(function () {
                    if (!inputValidateHELPER.checkInputValidity($(this), "Please enter a valid value")) {
                        allPassed = false;
                    }
                });

                if (inventoryStatesStore.productParams.type == 'sizable') {
                    if (!inputValidateHELPER.checkSelectValidity($form.find('.size-list'), 'Please select size first')) {
                        allPassed = false;
                    }
                }
                /* Do POST request when all fields are valid */
                if (allPassed) {
                    var extraParams = {
                        firstname: this.fn,
                        lastname: this.ln,
                        telephone:this.tel,
                        email: this.email,
                        store_id: inventoryStatesStore.reservationForm.storeId,
                        sku: inventoryStatesStore.reservationForm.sku
                    };

                    if (inventoryStatesStore.productParams.type === 'sizable') {
                        extraParams.quantity = 1;
                    } else {
                        extraParams.quantity = $form.find('input.qty-input').val();
                    }

                    console.log(extraParams);

                    $.ajax({
                        dataType: "json",
                        type: 'GET',
                        url: inventoryStatesStore.ajaxUrl.host,
                        data: extraParams
                    }).done(function (data) {
                        inventoryStatesStore.setReserveAttrs('reserveMsg', 'success');
                    }).fail(function () {
                        inventoryStatesStore.setReserveAttrs('reserveMsg', 'error');
                    });

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
        data: function(){
            return {
                params: inventoryStatesStore.productParams
            };
        },
        template: "#reserve-summary-template",
        computed: {
            finalPrice: function() {
                var unitPrice = this.params.unitPrice;
                var totalPrice = parseInt(this.params.qty) * unitPrice;
                return this.$root.formatPrice(totalPrice);
            },
            unitPrice: function() {
                var unitPrice = this.params.unitPrice;
                return this.$root.formatPrice(unitPrice);
            }
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
                       url: inventoryStatesStore.ajaxUrl.host,
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
                var sku = $('#reserve-overlay select.size-list').val();
                inventoryStatesStore.setReserveAttrs('sku', sku);
                inputValidateHELPER.checkSelectValidity($('#reserve-overlay select.size-list'), 'Please select size first');
            }
        },
        computed: {
            productParams: function() {
                var rawProductData = JSON.parse($('.product-data-mine2').data('lookup').replace(/'/g, '\"'));
                var productMapping = {};
                for (var key in rawProductData) {
                    productMapping[key] = {};
                    productMapping[key].sku = rawProductData[key].sku; 
                    productMapping[key].size = rawProductData[key].size;
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

            var rawProductData = JSON.parse($('.product-data-mine1').data('lookup').replace(/'/g, '\"'));
            var productDataKey = Object.keys(rawProductData);
            bePassedParams.unitPrice = Number(rawProductData[productDataKey[0]].price_numeric);

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

            this.statesStore.productParams = Object.assign({}, this.statesStore.productParams, bePassedParams);
        }
    });

});