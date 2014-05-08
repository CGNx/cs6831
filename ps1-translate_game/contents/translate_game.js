// This allows the Javascript code inside this block to only run when the page
// has finished loading in the browser.
$(function() {

	//Selects a random value from a one-level dictionary
    function selectRandom(dict) {
	    var result, step = 0;
	    
	    //This is a cascading randomization algorithm. Ex: If three items in dict
	    //Then we have 1 * 1/2 * 2/3 = 1/3 prob result is first key
	    //1/2 * 2/3 = 1/3 prob result is second key, and
	    //1/3 prob result is the third key.
	    for (var key in dict) {
	    	step = step + 1;
	    	if (Math.random() < (1 / step)) //Math.random() returns val in range (0 to 1)
	    		result = key;
	    }

	    return {answer : result, question : dict[result]};
	}

	//Input: a dict
	//Output: Array of keys
	function dict2array(dict) {
		result = [];
		for (var key in dict) {
			result.push(key);
		}
		return result;
	}

	//Input: dict, correct answer, user answer, question
	//Output: Handles answer submission and prepares for next query.
	function handle_answer(dict, question, answer, user_answer) {
		if (user_answer == answer) {
        	$('#results').prepend('<tr class="correct-row"><td>'+question+'</td><td>'+user_answer+'</td><td><span class="ui-icon ui-icon-check"></td></tr>');
        	++count_correct;
        	$("#count-correct").html(count_correct);
        }
        else {
        	$('#results').prepend('<tr class="wrong-row"><td>'+question+'</td><td style="text-decoration: line-through">'+user_answer+'</td><td>'+answer+'</td></tr>');
    		++count_wrong;
    		$("#count-wrong").html(count_wrong);
    	}

        //Prepare for next query
        query = selectRandom(current_dict);
		$("#query").html(query.question);
        $("#user-ans").val('');
        $("#user-ans").focus();        
		$("#user-ans").autocomplete("close");
	}

	//Set-Up UI
	function resetUI() {
		$(".title").width(800); //Resets title width so that all fits on one line
		$(".langto").html(lang_to); //Writes the language names on the screen
	    $(".langfrom").html(lang_from); 
	    $(".title").width($("#title-length").width() + 10); //Set title div to title width
	    $("#user-ans").focus(); //Set Textbox Input Focus    
		query = selectRandom(current_dict); //Initialize random word to translate
		$("#query").html(query.question);
		count_correct = 0;
		count_wrong = 0;
		$("#count-correct").html(count_correct);
		$("#count-wrong").html(count_wrong);
		$(".wrong-row,.correct-row").remove();
		$("#user-ans").autocomplete("close");
	}

	//Set-up variables
	var count_correct = 0;
	var count_wrong = 0;
	var query = "";
	var lang_to = "English";
	var lang_from = "Spanish";
	var current_dict = dicts[lang_to][lang_from]; // keys: words in @lang_to, values: corresponding words in @lang_from 	
	var tags  = dict2array(current_dict);

	//Rebuild autocomplete with new languages.
    $("#user-ans").autocomplete({
      select: function(event, ui){
      		console.log("auto function got here")
			handle_answer(current_dict, query.question, query.answer, ui.item.value);
	        return false; //Prevents adding selected value to textbox
      	}, source: tags, minLength: 2
    });

	//Set-up UI
    resetUI();

	//Defines functionality for the "See Answer" Button
	$("#see-ans").click(function() {
        handle_answer(current_dict, query.question, query.answer, $("#user-ans").val());
    });

    //Check for pressing Enter Key
    $('#user-ans').keypress(function(event){
	    var keycode = (event.keyCode ? event.keyCode : event.which); //browswer support
	    if(keycode == '13'){ //keycode 13 is the "Enter" key
        	handle_answer(current_dict, query.question, query.answer, $("#user-ans").val());
    	}
	});

	

	//Listens to select and Determines Languages we are using.
	$("#select-lang").change(function(){
		var text = $(this).val();
		if (text == "sp2en"){
			lang_to = "English";
			lang_from = "Spanish";
		}
		else if (text == "fr2en"){
			lang_to = "English";
			lang_from = "French";
		}
		else {
			lang_to = "German";
			lang_from = "Italian";
		}
		current_dict = dicts[lang_to][lang_from]; // keys: words in @lang_to, values: corresponding words in @lang_from 	
		tags  = dict2array(current_dict);
		$("#user-ans").autocomplete({
			source: tags
		});		
		resetUI();
	});

});
