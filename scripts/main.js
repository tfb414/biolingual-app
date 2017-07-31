var FULL_BODY_ELEMENT = document.getElementById("body-boxes");
var BODY_PART_SELECTOR = '[data-target="main-panel"] button';
var LANGUAGE_SELECTOR = '[data-target="select"]';
//derp

//reject within recieve translations
//want the body part clicked to be put in the translation thing function to display
//TO DO Get rid of storedTranslations all together line 85

function initialize(){
    if(pullDataFromLocalStorage('storedTranslations') == null){
        var storedTranslations = {
        "es": {},
        "zh-CN": {},
        'fr': {},
        "tl": {},
        "vi":{},
        "ko":{},
        "de":{},
        "ar":{},
        "ru":{},
        };
        localStorage.setItem('storedTranslations', JSON.stringify(storedTranslations));
    }else {
        // var storedTranslations = pullDataFromLocalStorage('storedTranslations');
    }
    $(document).ready(function() {
        console.log('derp');

        clickOnTheBoxes("#body-boxes", storedTranslations, drawToDom);
        console.log(pullDataFromLocalStorage('storedTranslations'));
        // console.log(storedTranslations);
    })

}

function clickOnTheBoxes(elementToSelect, storedTranslations, drawToDom){
    console.log($(elementToSelect).length);
    $(elementToSelect).on("load", function(event){
        console.log('it loaded');
        var a = FULL_BODY_ELEMENT;
        var svgDoc = a.contentDocument;
        var svgRoot  = svgDoc.documentElement;
        console.log($(svgRoot).find('[data-target="body-parts"]'));
        $(svgRoot).find('[data-target="body-parts"]').on("click", function(event){
            console.log('we found the rectangles')
            var bodyPart = $(event).find('class');
            console.log(bodyPart);
            // translateBodyPart(bodyPart);
            // console.log(bodyPart);
            var bodyNumID = event["currentTarget"]["id"];
            promiseChainToGetSymptomsAndTranslate(storedTranslations, bodyNumID)
                .then(function(data){
                console.log("we;re in the promise chain");
                console.log()
                drawToDom(data);
                // pullDataFromLocalStorage('storedTranslations');
                //this is where you will use the data that was clicked to create the boxes and add the data to the page.
                })
                .catch(drawToDom);
        })
   });
}

function dataToTranslate(searchString, language) {
    var data = {
        "key": googleTranslateToken,
        "q": searchString,
        "target": language
    };
    return data;
}

function retrieveTranslation(queryData, storedTranslations){
    if ((pullDataFromLocalStorage('storedTranslations'))[queryData.target][queryData.q]){
        return (pullDataFromLocalStorage('storedTranslations'))[queryData.target][queryData.q];
    }
    
    var P = $.post(GOOGLE_URL, queryData)
        .then(function(d){
            console.log('called the server');
            storedTranslations[queryData.target][queryData['q']] = d['data']['translations']['0']['translatedText'];
            // storedTranslations[queryData.target][queryData['q']] = 'test';
            sendDataToLocalStorage(storedTranslations[queryData.target], queryData.target)
            var P = new Promise(function(resolve, reject){
                resolve(storedTranslations[queryData.target][queryData['q']]);
            //TO DO Get rid of storedTranslations all together
            });      
            return P;      
        });
    return P;
}

function drawToDom(text){
    console.log(text);
}

function returnURLForSymptomChecker(bodyNumID){
    return APIMEDIC_URL + bodyNumID + "/woman";
}

function dataForSymptomChecker(){
    var data = {
        token: apiMedicToken,
        language: 'en-gb',
        format: 'json',
    }
    return data;
}
function retrieveSymptoms(bodyNumID){
    return $.get(returnURLForSymptomChecker(bodyNumID), dataForSymptomChecker())
    
}
function formatGetRequest(storedTranslations, rawData){
    var newDictionary = {};
    var translationResults = $.map(rawData, function(obj){
        var searchString = obj['Name'];
        var language = $(LANGUAGE_SELECTOR).val();
        var searchData = dataToTranslate(searchString, language);
        
        return retrieveTranslation(searchData, storedTranslations);
    });
    return Promise.all(translationResults).then(function(arrayOfResults){
        var dictionary = {}
        $.each(rawData, function(key, value){
            dictionary[value['Name']] = arrayOfResults[key];
        })
        return dictionary;
    })
}


function promiseChainToGetSymptomsAndTranslate(storedTranslations, bodyNumID){
    // console.log(storedTranslations)
    return retrieveSymptoms(bodyNumID).then(formatGetRequest.bind(this, storedTranslations));
}

function sendDataToLocalStorage(data, language){
    if (pullDataFromLocalStorage('storedTranslations') == null) {
        var currentData = {
        "es": {},
        "zh-CN": {},
        'fr': {},
        "tl": {},
        "vi":{},
        "ko":{},
        "de":{},
        "ar":{},
        "ru":{},
    };
    }
    else{
        var currentData = pullDataFromLocalStorage('storedTranslations');
    }
    currentData[language] = data

    localStorage.setItem('storedTranslations', JSON.stringify(currentData));
}
function pullDataFromLocalStorage(stringifiedJSONName){
    return JSON.parse(localStorage.getItem(stringifiedJSONName));
    
}

function translateBodyPart(bodyPart){
    console.log(bodyPart);
    var language = $(LANGUAGE_SELECTOR).val();
    var queryData = dataToTranslate(bodyPart, language);
    console.log(queryData);
    var d =  $.post(GOOGLE_URL, queryData);
    console.log(d);
}

initialize();
