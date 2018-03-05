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
                // emit event on change, actually used to pass new select value to cityChosen defined in v-model='cityChosen'
                .on('change', function () {
                    vm.$emit('input', this.value);
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
            $(this.$el).off().select2('destroy')
        }
    });

    Vue.component('store-inventory-list', {
        props: ['storeName', 'storePhone', 'sizes', 'ownStore'],
        template: "#store-inventory-template",
        computed: {
            productTypeClass: function(){
                if (typeof this.sizes !== "undefined") {
                    if (this.sizes.length === 1) {
                        return "store-item--onesize";
                    } else if (this.sizes.length >= 2) {
                        return " store-item--sizable";
                    }
                }else{
                    return "store-item--null";
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
            }
        }
    })

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
            cityChosen: "",
            url: {
                host: "http://127.0.0.1:5500/dest/json/inventory.json"
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
                       var cityList = Object.keys(vm.countryData);
                       cityList.unshift('');
                       vm.cityList = cityList;
                   });
                }
                this.showDropdown = !this.showDropdown;
            },
            switchList: function(city) {
              this.cityData = this.countryData[city] ? this.countryData[city] : false;
            }
        },
        mounted: function () {

        },
        created: function () {

        }
    })
});