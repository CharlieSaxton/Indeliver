    
// Initialize Cloud Firestore through Firebase
firebase.initializeApp({
    apiKey: 'AIzaSyBQo3KkP2-EcDUyaj8QG1LdzDgFmqrB3GA',
    authDomain: 'whodeliverstomyhome.firebase.com',
    projectId: 'whodeliverstomyhome'
});

// global vars
var db = firebase.firestore();
var filters;

function locatorButtonPressed() {
    disableGoogleAutocomplete();
    $("#locator-button").addClass("loading");

    navigator.geolocation.getCurrentPosition(function (position) {
            getUserAddressBy(position.coords.latitude, position.coords.longitude);
        },
        function (error) {
            $("#locator-button").removeClass("loading");
            alert("The Locator was denied :( Please add your address manually");
        })
}

function getUserAddressBy(lat, long) {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            var address = JSON.parse(this.responseText);
            var addressStr = address.results[0].formatted_address
            var addressArr = addressStr.split(",");
            addressArr.shift(2);
            addressArr[1] = addressArr[1].substr(0, addressArr[1].length - 5);
            var addressFinal = addressArr.toString().substring(1);
            setAddressToInputField(addressFinal);
            console.log(addressFinal);           
        }
    };
    xhttp.open("GET", "https://maps.googleapis.com/maps/api/geocode/json?latlng=" + lat + "," + long + "&key=AIzaSyBrGyhokdbkldz6M1bH98fy6A6sNsg0ncI", true);
    xhttp.send();
}

function setAddressToInputField(address) {
    $("#address").val(address);
    $("#search-form").submit();
    $("#locator-button").removeClass("loading");
    enableGoogleAutocomplete();
}

function search(event) {

    var userAddress = " " + $("#address").val();        
    var subAddress = userAddress.split(",")
    console.log("subaddress " + subAddress);
 
    $(".info-container").hide();
    $("#filter-section").show();

    $(results).html("");
    filters = [];
    db.collection("businesses").get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {    

            var deliveryArea = (`${doc.data().delivery_areas}`);
            var deliveryAreaArr = deliveryArea.split(",");

            console.log(deliveryArea);

            if(deliveryAreaCheck(deliveryAreaArr, subAddress)){

                filters.push(doc.data().type);
                var $businessDiv = makeBusinessDiv(doc, deliveryAreaArr);  
                $(results).append($businessDiv);
            }
        });

        $("#no-results").hide();

        if (!($("#results .business").length > 0)){ 
            $("#no-results").show();
            $(".filter-section").hide();
        }

        $("#filter-section .filters").html("");
        var i = 0;
        var addedFilters = [];
        filters.forEach((filter) => {
            if (!addedFilters.includes(filter)) {
                i++
                if (i == 3){
                    var spacer = $(`<div class="spacer"></div>`);
                    i = 0;
                }else{
                    var spacer = null;
                }

                var filterElement = $(`<input type="checkbox" checked="yes" id="${filter}checkbox" name="${filter}" value="${filter}" onclick="filter()"" class="toggle-box">`);
                var filterElement2 = $(`<Label for="${filter}checkbox" class="toggle toggle1">${filter}</Label>`);
                
                $("#filter-section .filters").append(filterElement, filterElement2, spacer);
                addedFilters.push(filter);

            }
            
        });
        
        
    });

    return false;

    function makeBusinessDiv(doc, deliveryAreaArr) {
        var $businessDiv = $(`<div class="background business ${doc.data().type} ${doc.data().delivery_areas}" onclick="window.open('${doc.data().website}', '_blank');"/>`);
        $businessDiv.append(`<p class='name name-${doc.data().type}' >${doc.data().name}</p>`);

        $businessDiv.append(`<a href="${doc.data().website}" target="_blank" class='website'><img src="img/Arrow.png" alt="Learn More" class="website-button"></a>`);
        if (deliveryAreaArr.length == 1) {
            $businessDiv.append(`<p class='delivery-area'>Delivers to ${deliveryAreaArr[0]}</p>`);
        }
        else {
            $businessDiv.append(`<p class='delivery-area'>Delivers to ${deliveryAreaArr[0]}...</p>`);
        }

        //needs changingvvvvvvvvvvvv
        if (`${doc.data().type}` == "Baked") {
            $businessDiv.append(`<p class='emoji'>&#129366; Baked</p>`);
        }
        else if (`${doc.data().type}` == "Produce") {
            $businessDiv.append(`<p class='emoji'>&#129382; Produce</p>`);
        }
        else if (`${doc.data().type}` == "Beverage") {
            $businessDiv.append(`<p class='emoji'>&#127870; Beverage</p>`);
        }
        else if (`${doc.data().type}` == "Seafood") {
            $businessDiv.append(`<p class='emoji'>&#127844; Seafood</p>`);
        }
        else if (`${doc.data().type}` == "Health") {
            $businessDiv.append(`<p class='emoji'>💊 Health</p>`);
        }
        else if (`${doc.data().type}` == "Meat") {
            $businessDiv.append(`<p class='emoji'>🥩 Meat</p>`);
        }
        else if (`${doc.data().type}` == "Other") {
            $businessDiv.append(`<p class='emoji'>&#128085; Other</p>`);
        }
        else if (`${doc.data().type}` == "Dairy") {
            $businessDiv.append(`<p class='emoji'>&#129371; Dairy</p>`);
        }
        else if (`${doc.data().type}` == "Ready-Food") {
            $businessDiv.append(`<p class='emoji'>&#128722; Ready-Food</p>`);
        }
        //needs changing^^^^^^^^^^^^

        return $businessDiv;
    }
}

function filter() {
    filters.forEach((filter) => {
        var checkboxid = "#" + filter + "checkbox";
        var businessSelector = "." + filter;
        var stickyFilterSelector = "." + filter + "-key";
        if($(checkboxid).is(":checked")) {
            $(businessSelector).show();
            $(stickyFilterSelector).show();
        } else {
            $(businessSelector).hide();
            $(stickyFilterSelector).hide();
        }
    })

}

var autocomplete;
var autocompleteListener;
function disableGoogleAutocomplete() {
    if (autocomplete !== undefined) {
            google.maps.event.removeListener(autocompleteListener);
            google.maps.event.clearInstanceListeners(autocomplete);
            $(".pac-container").remove();

            console.log('disable autocomplete to GOOGLE');
     }
}
function enableGoogleAutocomplete() {

    autocomplete = new google.maps.places.Autocomplete($("#address").get(0), {
        types: ['address'],
        componentRestrictions: {country: 'nz'}
    });
    

    autocompleteListener = autocomplete.addListener('place_changed', function() {
        $("#search-form").submit();
        //$("#address").focus();
    });

    console.log('set autocomplete to GOOGLE');
}
     
$(document).ready(function () {
    enableGoogleAutocomplete();

    $("#locator-button").on('click', locatorButtonPressed);
    $("#select-all").on('click', selectAll);
    $("#unselect-all").on('click', unSelectAll);

    $("#filter-section").hide();
    $("#no-results").hide();
});

function deliveryAreaCheck(shop, user){
    for(var i = 0; i < 5; i++){
        for(var k = 0; k < 5; k++){
            if(" " + shop[k] == user[i]){
                return(true);
            }
        }
    }
}


function selectAll(){
    console.log("Select All");
    filters.forEach((filter) => {
        var checkboxid = "#" + filter + "checkbox";
        $(checkboxid).prop("checked", true);
    });
    filter();
}

function unSelectAll(){
    console.log("Unselect All");
        filters.forEach((filter) => {
        var checkboxid = "#" + filter + "checkbox";
        $(checkboxid).prop("checked", false);
    });
    filter();
}



