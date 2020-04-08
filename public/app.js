    
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
        $("#address").focus();
        $("#locator-button").removeClass("loading");
    }

    function search(event) {

        var userAddress = " " + $("#address").val();        
        var subAddress = userAddress.split(",")
        console.log("subaddress " + subAddress);
     

        $("#filter-section").show();

        $(results).html("");
        filters = [];
        db.collection("businesses").get().then((querySnapshot) => {
            querySnapshot.forEach((doc) => {    

                var deliveryArea = (`${doc.data().delivery_areas}`);
                console.log(deliveryArea);

                if(" " + deliveryArea == subAddress[0] || " " + deliveryArea == subAddress[1] || " " + deliveryArea == subAddress[2] || 
                " " + deliveryArea == subAddress[3] || " " + deliveryArea == subAddress[4] || " " + deliveryArea == subAddress[5] || " " + deliveryArea == subAddress[6]){

                    filters.push(doc.data().type);
                    var $businessDiv = $(`<div class="background business ${doc.data().type} ${doc.data().delivery_areas}" onclick="window.open('${doc.data().website}', '_blank');"/>`)
                    $businessDiv.append(`<p class='name name-${doc.data().type}' >${doc.data().name}</p>`);

                    if (`${doc.data().type}` == "Bakery"){
                        $businessDiv.append(`<p class='emoji'>&#129366; Bakery</p>`);
                    }else if (`${doc.data().type}` == "Produce"){
                        $businessDiv.append(`<p class='emoji'>&#129382; Produce</p>`);
                    }else if (`${doc.data().type}` == "Beverage"){
                        $businessDiv.append(`<p class='emoji'>&#127870; Beverage</p>`);
                    }else if (`${doc.data().type}` == "Seafood"){
                        $businessDiv.append(`<p class='emoji'>&#127844; Seafood</p>`);
                    }else if (`${doc.data().type}` == "Pharmacy"){
                        $businessDiv.append(`<p class='emoji'>💊 Pharmacy</p>`);
                    }else if (`${doc.data().type}` == "Butchery"){
                        $businessDiv.append(`<p class='emoji'>🥩 Butchery</p>`);
                    }else if (`${doc.data().type}` == "Apparel"){
                        $businessDiv.append(`<p class='emoji'>&#128085; Apparel</p>`);
                    }else if (`${doc.data().type}` == "Diary"){
                        $businessDiv.append(`<p class='emoji'>&#129530; Diary</p>`);
                    }else if (`${doc.data().type}` == "Supermarket"){
                        $businessDiv.append(`<p class='emoji'>&#128722; Supermarket</p>`);
                    }

                    $businessDiv.append(`<a href="${doc.data().website}" target="_blank" class='website'><img src="img/Arrow.png" alt="Learn More" class="website-button"></a>`);
                    $businessDiv.append(`<p class='delivery-area'>Delivers to ${doc.data().delivery_areas}</p>`);
                    $businessDiv.append(`<p class='phone'>Phone: ${doc.data().phone}</p>`);
                    $businessDiv.append(`<p class='address'>Address: ${doc.data().address}</p>`);  
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
         
    $(document).ready(function () {
        var autocomplete;
        autocomplete = new google.maps.places.Autocomplete($("#address").get(0), {
            types: ['address'],
            componentRestrictions: {country: 'nz'}
        });
        
 
        autocomplete.addListener('place_changed', function() {
            // causes double ups when click enter
            //$("#search-form").submit();
            $("#address").focus();
        });

       $("#locator-button").on('click', locatorButtonPressed);

        $("#filter-section").hide();
        $("#no-results").hide();
    });