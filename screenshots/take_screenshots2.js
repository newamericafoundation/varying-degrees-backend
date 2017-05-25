var {vizSettings} = require("./vizSettings.js");
var {filterSettings} = require("./filterSettings.js");
console.log("starting")
var URLPaths = [];

getURLList();
// URLPaths = [
// "0/0/0/0",
// ];

function getURLList() {
	console.log("here!")
	// for (var topicIndex = 0; topicIndex < vizSettings.length; topicIndex++) {
	// 	console.log(topicIndex);
		var topicIndex = 2;
		var topicObject = vizSettings[topicIndex];
		// for (var questionIndex = 4; questionIndex < topicObject.questions.length; questionIndex++) {
			var questionIndex = 1;
			var questionObject = topicObject.questions[questionIndex];
			if (questionObject.subquestions) {
				addAllPaths(topicIndex, questionIndex, "none");
				for (var subquestionIndex = 0; subquestionIndex < questionObject.subquestions.length; subquestionIndex++) {
					addAllPaths(topicIndex, questionIndex, subquestionIndex);
				}
			} else {
				addAllPaths(topicIndex, questionIndex, "none");
			}
		// }
	// }
}

function addAllPaths(topicIndex, questionIndex, subquestionIndex) {
	URLPaths.push(topicIndex + "/" + questionIndex + "/" + subquestionIndex + "/all");

	for (var filterIndex = 0; filterIndex < filterSettings.length; filterIndex++) {
		var path = topicIndex + "/" + questionIndex + "/" + subquestionIndex + "/" + filterIndex;
		// console.log(topicIndex + "/" + questionIndex + "/" + subquestionIndex + "/" + filterIndex);
		URLPaths.push(path);
	}
}

var SCREENSHOT_WIDTH = 1200; 
var SCREENSHOT_HEIGHT = 2000; 
var LOAD_WAIT_TIME = 5000; 

var getPageTitle = function(page){
    var documentTitle = page.evaluate(function(){
        return document.title; 
    })
    console.log("getting title:", documentTitle)
    return documentTitle; 
}

var getPageHeight = function(page){
    var documentHeight = page.evaluate(function() { 
        return document.body.offsetHeight; 
    })
    console.log("getting height:", documentHeight)
    return documentHeight; 
}

var renderPage = function(page, path){

    // var title =  getPageTitle(page);

    var pageHeight = getPageHeight(page); 

    page.clipRect = {
        top:0,left:0,width: SCREENSHOT_WIDTH, 
        height: pageHeight
    };
    page.render(path + ".png");
    console.log("rendered: " + path + ".png")
}

var exitIfLast = function(index,array){
    console.log(array.length - index-1)
    console.log("~~~~~~~~~~~~~~")
    if (index == array.length-1){
        console.log("exiting phantomjs")
        phantom.exit();
    }
}

var takeScreenshot = function(element){
    console.log("opening URL:" + element)

    var page = require("webpage").create();

    page.viewportSize = {width:SCREENSHOT_WIDTH, height:SCREENSHOT_HEIGHT};

    var splitPieces = element.split("/");
    var path = "?topic=" + splitPieces[0] + "&question=" + splitPieces[1] + "&subquestion=" + splitPieces[2] + "&filter=" + splitPieces[3];

    page.open('http://varyingdegrees-embed.s3-website-us-west-2.amazonaws.com/' + path); 

    console.log("waiting for page to load...")

    page.onLoadFinished = function() {
        setTimeout(function(){
            console.log("that's long enough")
            renderPage(page, URLPaths[index])
            page.close();
            exitIfLast(index,URLPaths)
            index++;
            takeScreenshot(URLPaths[index]);
        },LOAD_WAIT_TIME)
    }

}

var index = 0; 

takeScreenshot(URLPaths[index]);