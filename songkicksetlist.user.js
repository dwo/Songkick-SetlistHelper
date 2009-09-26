// Songkick SetlistHelper
// version 0.1 BETA!
// 2009-09-20
// Copyright (c) 2009, Robin Tweedie (robin.tweedie@gmail.com)
// Released under the GPL license
// http://www.gnu.org/copyleft/gpl.html
//
// --------------------------------------------------------------------
//
// This script adds a textarea to the Songkick setlist interface.
// You can paste a newline separated setlist into the textarea and 
// initiate parsing of the setlist into the form with the "parse tracks" 
// button. You can also tick whether you would like common numbering 
// formats removed from the beginning of the track names.
//
// Uses jQuery (http://jquery.com/)
//
// Future plans:
// * support for parsing encores (have to be done manually for now)
// * option to convert tracks to sentence case once parsed
// 
// --------------------------------------------------------------------
//
// ==UserScript==
// @name          Songkick SetlistHelper
// @namespace     http://songkick.com
// @description   Makes adding setlists to Songkick.com easier
// @include       http://www.songkick.com/*/setlists/*
// ==/UserScript==

/*jslint white: true, onevar: true, browser: true, nomen: true, 
    eqeqeq: true, plusplus: true, bitwise: true, regexp: true, 
    newcap: true, immed: true */

/**
* @param	string     prefix
* @param	int        id
* @return 	jQuery
*/
function create_track_input(prefix, id) {
	var html = {};
	//build a new song input
    html.new_item = $("<dd></dd>");
    
    html.new_input = $("<input type='text' />");
    html.new_input.attr("id", prefix + id);
    html.new_input.attr("name", prefix + id);
    html.new_input.addClass("text");
    
    html.new_item.append(html.new_input);
    
    //append new song to list in appropriate place
    html.prev_id = id - 1;
    $("#" + prefix + html.prev_id).parent().after(html.new_item);
        
    return html.new_input; //return jQuery object of new input
}

/**
* Strips several common forms of numbering & whitespace from the 
* front of a string using a regular expression
* examples that would be stripped: 1) #2 3. 4: 5
* @param	string	input_string
* @return	string
*/
function strip_numbering(input_string) {
	return input_string.replace(/^(\s*[#\d\.:\)]*\s*)/i, '');
}

/**
* Splice blank tracks out and strip numbering if specified
* @param	array	track_array
* @return	array
*/
function clean_tracks(track_array, strip_numbers) {
	for (var i = 0; i < track_array.length; i = i + 1) {	
		//strip numbering if specified
		if (strip_numbers) {
			track_array[i] = strip_numbering(track_array[i]);
		}
		//remove track if blank
		if (track_array[i].length === 0) {
			track_array.splice(i, 1);
			i = i - 1;
			continue;
		}
	}
	return track_array;
}

/**
* @param	string	input_string
* @param	bool	strip_numbers			whether or not to strip numbers
* @return	array
*/
function parse_tracks(input_string, strip_numbers) {
    var track_array = input_string.split("\n");
    track_array = clean_tracks(track_array, strip_numbers);
    return track_array;   
}

function insert_track(prefix, i, track_name) {
	var track_input = $("#" + prefix + i);
    
    //create a new input field if it doesn't already exist
    if (track_input.length !== 1) {
    	track_input = create_track_input(prefix, i);
    } 
    
    track_input.val(track_name);
}

/**
* @param prefix is the prefix of the track inputs
*/
function insert_tracks(prefix, track_array) {
    for (var i = 0; i < track_array.length; i = i + 1) {
        insert_track(prefix, i, track_array[i]);
    }
    return i;
}

var onGoClick = function () {
    var sl_paste = $("#sl_paste");
    
    //insert tracks by parsing from paste area, taking number stripping option into account
    insert_tracks("main_track_", parse_tracks(sl_paste.val(), $("#parse_clean")[0].checked));
    sl_paste.val('');
};

/**
* Start injecting HTML and adding event listeners.
*/
function init() {   
	var html = {};     
    html.deflist = $("div.fieldset dl:first");
    
    html.label = $("<dt><label>Paste setlist here</label></dt>");
    html.deflist.prepend(html.label);
    
    html.dd = $("<dd></dd>");
    
    html.paste_area = $("<textarea id='sl_paste'></textarea>");
    html.paste_area.css({"width": "180px", "height": "130px"});
    html.dd.append(html.paste_area);
    html.label.after(html.dd);
    
    html.clean_checkbox = $("<dd><input id='parse_clean' type='checkbox' /> Remove numbering from beginning of track names</dd>");
    html.dd.after(html.clean_checkbox);
    
    html.go_btn = $("<dd><input class='submit button' type='button' value='Parse tracks' /></dd>");
    html.clean_checkbox.after(html.go_btn);
    //add click event handler to Go button
    html.go_btn.click(onGoClick); 
}

/**
* Recusively checks for jQuery to be loaded.
*/
function GM_wait() {
    if (typeof unsafeWindow.jQuery === 'undefined') { 
        window.setTimeout(GM_wait, 100); 
    } else { 
        $ = unsafeWindow.jQuery; 
        init(); 
    }
}

// Add jQuery
var GM_JQ = document.createElement('script');
GM_JQ.src = 'http://code.jquery.com/jquery-latest.min.js';
GM_JQ.type = 'text/javascript';
document.getElementsByTagName('head')[0].appendChild(GM_JQ);
var GM_start = new GM_wait();