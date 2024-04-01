/* Jesus Valenzuela, Kyle Johnson, Reni Wu, Sabrina Jackson
CS 491 Instructor: Jordan Hastings
Goals: Make a jquery function to load json into calendar  */

async function getJSONDataAsync(URL) {
    var response = await fetch(URL);
    var data = await response.json();
    return data;
}

data = $.parseJSON(jsonData);
const URL = 'https://smartpoint.co/api/nbca.5000Birch'
let JSONIN = data;

function populateCalendar(jsonData) {
//Parses JSON data
    classArray = jsonData;

    // Adjust width of header cells
    $("th").each((ic, el) => {
        if (ic > 0) {
            el.width = 100;
        }
    });

    // Right-align only row 2 indexes
    $("tr").each((ir, el) => {
        if (ir > 0) {
            $("td", el).each((ic, el) => {
                el.align = "RIGHT";
            });
        }
    });

    // Fill entire array with <td>s
    $("tr").each((ir, el) => {
        if (ir >= 1) {
            for (ic = 1; ic <= 7; ic++) {
                el.append(document.createElement("td"));
            }
        }
    });

    // Set unique IDs for the <td> elements
    $("tr").each((ir, el) => {
        const hourCell = $(el).find("td:first-child"); // Get the first <td> in the row
        const hourContent = hourCell.text(); // Get the content of the cell
        const hourMatch = hourContent.match(/\d{1,2}:\d{2}[APMN]+/); // Extract the hour format (e.g., "12:00PM" or "12:00N")

        if (hourMatch) {
            const hour = hourMatch[0].replace(":", "").trim(); // Extract the hour (e.g., "1200PM" or "1200N")
            $("td", el).each((ic, el) => {
                if (ic > 0) {
                    $(el).attr("id", hour + ic);
                }
            });
        }
    });
    // Find all elements with IDs using jQuery
    var allIds = $("*").map(function() {
        return this.getAttribute("id");
    }).get();


    // Log the array of IDs
    //console.log(allIds);
    load(classArray); //initial loading of all class types

    //Code that will call filterandloadCLasses function whenever the selector changes
    $("#Type, #Number").on("change", function() {
        filterAndLoadClasses(classArray);

    });
}


//function for determining the selector and creating and filling a new array containing the filtered class types;
function filterAndLoadClasses(classArray){
    const typeSelector = $("#Type").val();
    const numSelector = $("#Number").val();
    let filteredArray = [];

    //if typeSelector is not all then iterate through the class array and check if the course has the type included in the string
    if(typeSelector !== "ALL" && numSelector !== ""){
        filteredArray = classArray.filter((_, idx) => { //filter creates a new array that contains the elements of the original array that return true using the code provided below
            let sec = classArray[idx][2];
            let classNum = classArray[idx][0];
            return (sec.includes(typeSelector) && numStartsWith(classNum, $("#Number").val())); //if sec
        });
    } else if(typeSelector !== "ALL" && numSelector === ""){
        filteredArray = classArray.filter((_, idx) => {
            let sec = classArray[idx][2];
            return sec.includes(typeSelector);
        });
    } else if(typeSelector === "ALL" && numSelector !== ""){
        filteredArray = classArray.filter((_, idx) => {
            let classNum = classArray[idx][0];
            return numStartsWith(classNum, $("#Number").val());
        });
    } else {
        //removing the first element in the array which are just the headers
        filteredArray = classArray.slice(1);
    }
    //Have to empty the calendar of all classes prior to laoding in the new classes
    $("tr").find("td:not(:first-child)").empty();
    //passing the newly filtered array into the load function
    load(filteredArray);
}



function load(array) {
    const dow = ["", "Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
    for (var n = 0; n < array.length; n++) { //Modified Jeesus' indexing from n=1 to n=0 since I sice the classArray.
        var crs = array[n][0];
        var sec = array[n][2];
        var dtm = array[n][3];
        var i = dtm.indexOf(" "), i1 = dtm.indexOf(":");
        for (var ic = 1; ic <= 7; ic++) {
            if (dtm.indexOf(dow[ic]) >= 0) {
                var id = dtm.slice(i + 1, i1 + 4).replace(":", "") + ic;
                var hourCell = document.getElementById(id);
                if (hourCell) {
                    var t = hourCell.innerText;
                    t += (t.length ? "\n" : "") + crs.slice(0, 7) + sec.slice(-3);
                    hourCell.innerText = t;
                } /* else {
                    console.log(`No cell found for ID: ${id}`);
                    console.log($("#Number").val());
                } */
            }
        }
    }
}

/**
 * Adds hover effects to filled cells within a table. On mouse enter, it changes the cell's background color,
 * retrieves the time from the leftmost column, and updates the cell's text to show the full course description.
 * On mouse leave, it resets the cell's background color and text to its previous state.
 * Depends on global `obj` for course descriptions and `validSpace` to check cell validity.
*/
function hoverInfo(){
    // Add hover event for table elements
    $("td").hover(function() { // For mouse entering a table element
            // Get time from leftmost column
            time = ($(this).closest("tr").text().trim().slice(0, 4));
            if(!validSpace(this)) return;
            $(this).css("background-color", "lightgrey");
            // Update text in block to show full course description
            var newText = obj.join('\n');
            $(this).text(newText);
        },
        function() { // For mouse exiting a table element
            if(!validSpace(this)) return;
            $(this).css("background-color", "");
            //if($(this).text().indexOf("LAB") >= 0) $(this).css("backgroundColor","#ccf")
            var cellText = $(this).text().split(" ");
            // Return text to previous state
            $(this).text(cellText[0] + " " + cellText[1] + " " + $(this).data("obj")[2].slice(-3));
        });
}

/**
 * Checks if a table cell is a valid space by determining if it is empty or contains a time.
 * This function is called by the hoverInfo function.
 * 
 * @param {HTMLElement} cell - A table element (cell) to check if the space already contains a time or not.
 * @returns {boolean} Returns false if the cell is empty or contains a number (1-9) indicating a time; otherwise, checks for a class matching the calendar description in JSON data and returns true if found.
 */
function validSpace(cell){
    var t = $(cell).text();
    first = t.charAt(0);
    // Determines if space is empty or contains a time
    if (t == "" || (first >= 1 && first <= 9)) return false;
    // Checks if a class matching the calendar description was found in JSON data
    obj = getData(time, $(cell).text());
    // Saves the original text
    $(cell).data("obj", obj);
    return obj != null;
}

/**
 * Retrieves data based on provided date and text. This function is called by the validSpace function.
 * For each entry in the class array, it checks if the time, course name, and type match the provided criteria.
 * 
 * @param {string} date - A date string to check for corresponding entries in the JSON array.
 * @param {string} text - A text string used to match course name and type in the JSON array.
 * @returns {Object|array} The matching class array entry, or undefined if no match is found.
 */
function getData(date, text){
    // For each JSON array, check if the time, course name, and type match
    for(var i = 0; i < classArray.length; i++){
        if(classArray[i][3].includes(date) && classArray[i][ 0].includes(text.split(' ')[1]) && classArray[i][2].includes(text.split(' ')[2])) return classArray[i];
    }
}


//PopulateClasses function should be a jquery call to call function when the rest of the website has been finished

populateCalendar(JSONIN)
hoverInfo();

//CSS styling using Jquery
$("th").css({"font-family": "serif", "background-color": "midnightblue", "width": "155px", "height":"50px", "color":"white"});
$("td").css({"font-family": "sans-serif", "font-size":"12px", "text-align":"center", "width": "155px", "height":"50px"});
$("img").css({"width": "80px", "height": "80px", "display": "block", "position": "static"});
$("#wDept").css({"left": "1230px"});
$(".title").css({"font-size": "X-large", "text-align": "center", "display": "flex", "justify-content":"center"});


