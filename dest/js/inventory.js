jQuery(function ($) {
    /* Create vue component of select element where select2 jQuery plugin is applied */
    Vue.component('mari-select2', {
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

    Vue.component('store-inventory-list', {
        props: ['storeName', 'contact', 'sizes', 'ownStore', 'countryCode', 'openingHours'],
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
            productType: function(){
                if (typeof this.sizes !== "undefined") {
                    if (this.sizes.length === 1) {
                        return "onesize";
                    } else if (this.sizes.length >= 2) {
                        return "sizable";
                    }
                }else{
                    return "null";
                }
            },
            locale: function(){
                if (this.countryCode === 'FI') {
                    return "FI";
                }else{
                    return "EN";
                }
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
            }
        }
    });

    Vue.component("store-contact-overlay", {
        props:['storeContact'],
        template: "#store-contact-overlay",
        updated: function(){
            $(this.$el).modal();
        },
        mounted: function () {
            $(this.$el).modal();
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
            url: {
                host: "http://localhost:5500/dest/json/inventory-no-stock.json"
            }
        },
        methods: {
            toggleDropdown: function () {
                var extraParams = '';
                this.countryCode = 'FI';
                var vm = this;
                if (!this.countryData) {
                   $.get({
                       // beforeSend: BEATHELPER.toggleLoadingIcon($chartBodyName, true, isID),
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
        }
    })
});