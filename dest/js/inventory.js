jQuery(function ($) {
    /* Create vue component of select element where select2 jQuery plugin is applied */
    Vue.component('city-select2', {
        props: ['options', 'value'],
        template: '<select>\
        <slot></slot>\
        </select>',
        mounted: function () {
            var vm = this
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
                })
        },
        watch: {
            value: function (value) {
                // update value
                $(this.$el).val(value)
            },
            options: function (options) {
                // update options
                $(this.$el).empty().select2({
                    data: options,
                    placeholder: 'Valitse kaupunki',
                    width: "element",
                    theme: "marimekko"
                })
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
            var vm = this
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
            var vm = this
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
        props: ['storeName', 'contact', 'sizes', 'ownStore', 'countryCode', 'openingHours', "productType", "productMapping", "storeId"],
        template: "#store-inventory-template",
        data: function(){
            return {
                oneSizeMapping: {
                    'FI': [null, "Varastossa", "Vähän jäljellä", "Loppuunmyyty"],
                    'EN': [null, "In stock", 'Few left', "Out of stock"]
                }
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
                if (this.ownStore) {
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
                var address = this.contact.address.split(',').map(function(ad){return ad.trim()});
                var contactInfo = {
                    name: this.storeName,
                    address: address,
                    openingHours: this.openingHours,
                    phone: this.contact.phone
                };
                this.$parent.storeContactInfo = contactInfo;
            },
            prepareReserveForm: function() {
                if (this.productType === 'sizable' && this.hasInventory) {
                    var vm = this;
                    /* Empty size select*/
                    var $sizeSelect = $(this.$parent.$el).find('select.size-list');
                    $sizeSelect.empty().append("<option></option>");

                    /* Attach storeID to the reservation form */
                    $('.reserve-form--product > input.store-id').val(this.storeId);

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
                                $sizeOption.addClass('size-option--orange').html("<span>" + size.product_size + "</span> - vähän jäljellä")
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
                }

                $('#reserve-overlay').modal();
            }
        }
    });

    Vue.component("store-contact-overlay", {
        props: ['storeContact'],
        template: "#store-contact-overlay",
        updated: function () {
            $(this.$el).modal();
        },
        mounted: function () {
            $(this.$el).modal();
        }
    });

    /* Reserve & Collect Component */
    Vue.component("reserve-collect-overlay", {
        props: ['productType'],
        template: "#reserve-collect-overlay",
        methods: {
            /* Verify every input field given by user*/ 
            checkReserveFormValidity: function () {
                var allPassed = true;
                $(this.$el).find('input').each(function() {
                    if(!inputValidateHELPER.checkValidityAndSetCustomErrorMsg($(this), "Please enter a valid value")){
                        allPassed = false;
                    }
                });

                /* Do POST request when all fields are valid */
                if (allPassed) {
                 
                }
            }
        },
        mounted: function() {
            
            if (this.productType === 'onesize') {
                
                initQuantitySelector($(this.$el).find('.qty-selector'));
            
            }
            
        }
    });

    // root vue app
    window.inventoryApp = new Vue({
        el: "#inventory-app",
        data: {
            dropDownClass: "city-selector",
            showDropdown: false,
            countryCode: false,
            countryData: false,
            cityData: false,
            cityList: false,
            cityChosen: false,
            storeContactInfo: false,
            popupReserveForm: false,
            url: {
                host: "http://localhost:5500/dest/json/inventory.json"
            }
        },
        methods: {
            toggleDropdown: function () {
                var extraParams = '';
                this.countryCode = 'FI';
                var vm = this;
                if (!this.countryData) {
                   $.get({
                       dataType: "json",
                       url: this.url.host,
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
            }
        },
        computed: {
            productParams: function() {
                var rawProductData = JSON.parse($('.product-data-mine2').data('lookup').replace(/'/g, '\"'));
                var productMapping = {};
                for (var key in rawProductData) {
                    productMapping[key] = {};
                    productMapping[key].mag_id = rawProductData[key].id; 
                    productMapping[key].size = rawProductData[key].size;
                }
                return {
                    type: $('ul.list-size > li').length > 1 ? "sizable" : "onesize",
                    product_mapping: productMapping
                }
            }
        }
    })
});