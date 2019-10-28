// Pet Finder API
var pfKey = "HnjUqj64YGTy3issTGRAHpa8OY2ISTLk0h6mkGBPHS5c7vzEne";
var secret = "9Duuxvzs7cN68tlp0Hfz0AbZNONGNSOhcC7gyHeq";
var tokenURL = "https://api.petfinder.com/v2/oauth2/token";
var token;
var animalType;
var myOrganizations = [];
var zipCode;
var distance;
let animalData = {};
let breedArry = [{}];
let genderArry = [{}];
let ageArry = [{}];
let genderageMatch = [{}];
let filteredData = {animals:[{}]};
let filteredDataArry = [{}];
var filtered = 0;
var breedInfo = [{}];

// The Dog API
var tdKey = "&api_key=001c4707-96d1-4e30-9be2-fa2222eb08f2";
var tdURL = "https://api.thedogapi.com/v1/breeds/search?q=";
var breedURL = "https://api.thedogapi.com/v1/breeds/?api_key=001c4707-96d1-4e30-9be2-fa2222eb08f2";

async function populateBreedInfo() {
    var response = await fetch(breedURL);
    var breeds = await response.json();

    for (i in breeds) {
        var uses = breeds[i].bred_for;
        //var temperment = breeds[i].temperment;
        var lifeSpan = breeds[i].life_span;
        var weight = breeds[i].weight.imperial;
        
        breedInfo[i] = {breed: breeds[i],
                        info: `
                        <div>Life Span: ` + lifeSpan + `</div>
                        <div>Adult Weight: ` + weight + ` lbs.</div>
                        <div>Bred For: ` + uses + `</div>
                    `
        };
        
    }
}

async function generateBreedList() {
    var response = await fetch(breedURL);
    var breeds = await response.json();

    

    var breedList = document.getElementById("selectBreed");
    
    for (var i = 0; i < breeds.length; i++) {
        for (var j = 0; j < animalData.animals.length; j++) {
            if (breeds[i].name === animalData.animals[j].breeds.primary) {
                var breedName = breeds[i].name;
                var breed = document.createElement("option");
                breed.value = ++i;
                breed.innerText = breedName;
                breedList.appendChild(breed);

                //breedInfo[i] = fillAnimalInfo(breeds[i],i,animalData.animals[j].breeds.primary);
            }
        }
    }
}

function filterResults() {
    var b = document.getElementById("selectBreed");
    var g = document.getElementById("selectGender");
    var a = document.getElementById("selectAge");
    var j = 0, k = 0, l = 0, x = 0, y = 0;
    var breed = b.options[b.selectedIndex].text; 
    var gender = g.options[g.selectedIndex].text;
    var age = a.options[a.selectedIndex].text; 

    // Reset animal pool for new filter selections
    if (filtered === 1) { 
        filteredData = {animals:[{}]};
        filteredDataArry = [{}];
        breedArry = [{}];
        genderArry = [{}];
        ageArry = [{}];
    }

    // Create a filtered array for each filter field
    for (i in animalData.animals) {
        if (breed !== "Any") {
            if (animalData.animals[i].breeds.primary === breed) {
                breedArry[j++] = animalData.animals[i];
            }
        } else { breedArry = animalData.animals }

        if (gender !== "Any") {
            if (animalData.animals[i].gender === gender) {
                genderArry[k++] = animalData.animals[i];
            }
        } else { genderArry = animalData.animals }

        if (age !== "Any") {
            if (animalData.animals[i].age === age) {
                ageArry[l++] = animalData.animals[i];
            }
        } else { ageArry = animalData.animals }
    }
    console.log("Breed Array");
    console.log(breedArry);

    console.log("Age Array");
    console.log(ageArry);

    var bLen = breedArry.length;
    var gLen = genderArry.length;
    var aLen = ageArry.length;

    // Compare filtered arrays and compile into final filtered array
    for (i = 0; i < gLen; i++) {
        for (j = 0; j < aLen; j++) {
            if (genderArry[i].id === ageArry[j].id) {
                genderageMatch[x++] = genderArry[i];
            }
        }
    }
    console.log("Gender-Age Match");
    console.log(genderageMatch);

    for (i = 0; i < bLen; i++) {
        for (j = 0; j < genderageMatch.length; j++) {
            if (breedArry[i].id === genderageMatch[j].id) {
                filteredDataArry[y++] = breedArry[i];
            }
        }
    }
    filteredData.animals = filteredDataArry;
    console.log(filteredData);
    filtered = 1;
    populateImgResults(filteredData);
}

// Acquire breed information from The Dog API
async function getBreedInfo(breed) {
    var response = await fetch(tdURL+breed+tdKey);
    var tdData = await response.json();
   
    var uses = tdData[0].bred_for;
    var temperment = tdData[0].temperment;
    var lifeSpan = tdData[0].life_span;
    var weight = tdData[0].weight.imperial;
    
    breedInfo = `
                    <div>Life Span: ` + lifeSpan + `</div>
                    <div>Adult Weight: ` + weight + `lbs.</div>
                    <div>Temperment: ` + temperment + `</div>
                    <div>Bred For: ` + uses + `</div>
                `;
    
    return breedInfo;
}

// Pet Finder API Endpoints
let pfEndpoints = {
    organizations: "https://api.petfinder.com/v2/organizations",
    dogs: "https://api.petfinder.com/v2/animals?type=Dog",
    types: "https://api.petfinder.com/v2/types",
    breeds: "https://api.petfinder.com/v2/types/Dog/breeds"
}

// Pet Finder API fields for acquiring token
let tokenFields = {
    method: "POST",
    body: "grant_type=client_credentials" + 
          "&client_id=" + pfKey + 
          "&client_secret=" + secret,
    headers: {
        "Content-Type": "application/x-www-form-urlencoded"
    }
};

// Authorization header for Pet Finder API
// 'headers' field filled in refreshToken()
let pfAuthorization = {
    method: "GET",
    headers: {}
}

// Acquire token from Pet Finder API
async function refreshToken() {
    var response = await fetch(tokenURL, tokenFields);
    var data = await response.json();
    token = data.access_token;
    pfAuthorization.headers = {Authorization: "Bearer " + token};
}

async function getLocations(zip, radius) {
    let response = await fetch(pfEndpoints.organizations+"?location="+zip+"&distance="+radius, pfAuthorization);
    let data = await response.json();
    data.organizations.forEach(function(organizations) {
        myOrganizations.push({
            name: organizations.name,
            id: organizations.id
        });
    })
    console.log("%c Organizations", "color: orange;");
    console.log(myOrganizations);
}

async function getTypes() {
    var URL = pfEndpoints.types
    let response = await fetch(URL, pfAuthorization);
    let data = await response.json();
    console.log(data);
}

// Verify search fields befor submitting search
function verifySearch() {
    var zipcode = document.getElementById("zipCode").value;
    var distance = document.getElementById("distance").value;

    if (zipcode.length === 0){
        alert("Please Enter Valid 5-Digit ZIP Code");
    } else if (distance.length === 0) {
        alert("Please Enter Search Distance");
    } else {
        getAnimals(zipcode, distance);
    }
}

// Get available animals based on search parameters
async function getAnimals(location, distance) {
    try {
        var URL = pfEndpoints.dogs+"&location="+location+"&distance="+distance+"&limit=100"
        let response = await fetch(URL, pfAuthorization);
        animalData = await response.json();
        animalDataMod = animalData;
        console.log(animalData);
        document.getElementById("filterContainer").className = "";
        // Generate breeds available to filter by
        generateBreedList();
        populateImgResults(animalData);
    } catch(e) {
        alert("Please Enter Valid US ZIP code and Distance");
    }
}

function populateImgResults(data) {
    var i = 0;
    var j = 0;

    // Clear previous search results
    document.getElementById("searchResults").innerHTML = "<div class='row justify-content-center'></div>";
    
    // Populate images on page
    for (var i = 0; i <= Math.floor(animalData.animals.length/3); i++) {
        for (j = 0; j < 3; j++) {

            // Current animal details structure
            let currentAnimal = data.animals[3*i+j];
            var photo = currentAnimal.photos;
            
            // If no photo exists, skip
            //if(Object.entries(photo).length === 0) { continue; }
            if(photo.length === 0) { 
                animalData.animals.splice((3*i+j),1);
                j--;
                continue; 
            }

            // Create new document elements
            var col = document.createElement("div");
            var img = document.createElement("img");
            var a = document.createElement("a");
            var animalInfo = fillAnimalInfo(currentAnimal);
            //var fullInfo = finishInfo(animalInfo, currentAnimal);
            // Add animal photo
            img.src = photo[0].full;
            img.className = "rounded img-fluid";
            img.style = "width:100%";

            // Add a-tag wrapper for popover information
            a.classList.add("searchRes");
            a.href = "#";
            a.title = currentAnimal.name;
            a.setAttribute("data-toggle","popover");
            a.setAttribute("data-content", animalInfo);
            a.appendChild(img);
            
            // Add bs column wrapper
            col.className = "col-3";
            col.appendChild(a);
        
            // Append new animal to document
            document.getElementById("searchResults").children[i].appendChild(col);   
        }

        // Create & append new row for next iteration
        var row = document.createElement("div");
        row.className = "row top-buffer justify-content-center";   
        document.getElementById("searchResults").appendChild(row); 

        // Enable popover
        initjQueryPopover('.searchRes');
    }
}
/*
function fillAnimalInfo(animal) {
    var breed = animal.breeds.primary;
    var breedInfo = getBreedInfo(breed);
    
   /* breedInfo.then(function(breedInfo, breed) {
        return breedInfo;
    });
    return breedInfo;
}*/

function fillAnimalInfo(animal) {
    var gender = animal.gender;
    var species = animal.species;
    var breed  = animal.breeds.primary;
    var age = animal.age;
    var infoLink = animal.url;
    var desc;
    for (i in breedInfo) {
        if (breedInfo[i].breed.name === breed) {
            desc = breedInfo[i].info;
            break;
            
        } else { var desc = '' }
    }
    
    //var info = getBreedInfo(curBreed);
    var block = `
                    <div class='container'>
                        <div class='row'>
                            <div class='col'>
                                <div> Gender: ` + gender + `</div>
                                <div> Species: ` + species + `</div>
                                <div> Breed: ` + breed + `</div>
                                <div> Age: ` + age + `</div>
                                <a target='_blank' href='`+ infoLink +`'> More Info </a>
                            </div>
                        </div>
                        <div class='row'>
                            <div class='col'>
                                <div><b>About this Breed:</b></div>
                                <div>` + desc + `</div> 
                            </div>
                        </div>
                    <div>
                `;
                console.log(block);
    //<a role='button' href='`+ infoLink +`'> More Info </a>
    //<button data-content="<a href='`+ infoLink +`'></a>">More Info</button>
    return block;
}

/*function finishInfo(breedInfo, animal) {
        var breed = animal.breeds.primary;
        var gender = animal.gender;
        var species = animal.species;
        var infoLink = animal.url;
        
        var content = `
                        <div class='container'>
                            <div class='row'>
                                <div class='col'>
                                    <div> Gender: ` + gender + `</div>
                                    <div> Species: ` + species + `</div>
                                    <div> Breed: ` + breed + `</div>
                                    <a target='_blank' href='`+ infoLink +`'> More Info </a>
                                </div>
                            </div>
                            <div class='row'>
                                <div class='col'>
                                    <div><b>About this Breed:</b></div>
                                    <div>` + breedInfo + `</div> 
                                </div>
                            </div>
                        <div>
                    `;
        //<a role='button' href='`+ infoLink +`'> More Info </a>
        //<button data-content="<a href='`+ infoLink +`'></a>">More Info</button>
        return content;       
}*/

/*
function fillAnimalInfo(animal) {
    var gender = animal.gender;
    var species = animal.species;
    var breed = animal.breeds.primary;
    var organization = animal.organization_id;
    var animalID = animal.id;
    var infoLink = animal.url;
    
    var content = `
                    <div class='container'>
                        <div class='row'>
                            <div class='col'>
                                <div> Gender: ` + gender + `</div>
                                <div> Species: ` + species + `</div>
                                <div> Breed: ` + breed + `</div>
                                <a target='_blank' href='`+ infoLink +`'> More Info </a>
                            </div>
                        </div>
                        <div class='row'>
                            <div class='col'>
                                <div><b>About this Breed:</b></div>
                                <div>` + breedInfo `</div> 
                            </div>
                        </div>
                    <div>
                `;
    //<a role='button' href='`+ infoLink +`'> More Info </a>
    //<button data-content="<a href='`+ infoLink +`'></a>">More Info</button>
    //return content;
}*/

// Enable Popovers & Disable Default Behavior to Prevent
// scroll to top of page on click
function initjQueryPopover(popClass) {
    $(document).ready(function() {
        $(popClass).popover({
            trigger: "focus",
            html: true,
            sanitize: false,
            content: function() {
            return $("#searchFormsub").html();
            }  
        }).on("mouseenter", function () {
            var _this = this;
            $(this).popover("show");
            animalType = $(this).attr("data-animalType");
            console.log(animalType);
            $(".popover").on("mouseleave", function () {
                $(_this).popover('hide');
            });
        }).on("mouseleave", function () {
            var _this = this;
            setTimeout(function () {
                if (!$(".popover:hover").length) {
                    $(_this).popover("hide");
                }
            }, 300);
        });
    });


    $('[data-toggle="popover"]').click(function(e) { 
        e.preventDefault(); 
    });
}