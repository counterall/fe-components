jQuery(function ($) {
       
    window.inventoryApp = new Vue({
        el: "#inventory-app",
        data: {
            dropDownClass: "city-selector",
            showDropdown: false,
            cityList: [
                { id: 1, text: 'Hello' },
                { id: 2, text: 'World' }
            ],
            cityChosen: ''
        },
        methods: {
            toggleDropdown: function () {
                this.showDropdown = !this.showDropdown;
            },
            switchList: function () {
                
            }
        },
        mounted: function () {

        },
        created: function () {

        },
        components: {
            'select2': {
                props: ['options', 'city'],
                template: "#select2-template",
                mounted: function () {
                    var vm = this
                    console.log(this);
                    $(this.$el)
                        // init select2
                        .select2({
                            data: this.options,
                            placeholder: 'Valitse kaupunki',
                            width: "element",
                            theme: "marimekko"
                        })
                        .val(this.city)
                        .trigger('change')
                        // emit event on change.
                        .on('change', function () {
                            vm.$emit('input', this.city)
                        })
                },
                watch: {
                    value: function (city) {
                        // update value
                        $(this.$el).val(city)
                        console.log($(this.$el).val(city));
                    },
                    options: function (cityList) {
                        // update options
                        $(this.$el).empty().select2({
                            data: cityList
                        })
                    }
                },
                destroyed: function () {
                    $(this.$el).off().select2('destroy')
                }
            }
        }
    })
});