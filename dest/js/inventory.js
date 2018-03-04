jQuery(function($){

    var inventoryApp = new Vue({
        el: "#inventory-app",
        data: {
           showDropdown: false,
           cityList:['No available city'],
           cityChosen: null
        },
        methods: {
            toggleDropdown: function(){
                this.showDropdown = !this.showDropdown;
            },
            switchList: function () {
            }
        },
        mounted: function() {
            
        },
        created: function() {
 
        }
    });

    /* Render Select2 dropdown*/
    $('.city-selector').select2({
        placeholder: 'Valitse kaupunki',
        width: "element",
        theme: "marimekko"
    });
    
});