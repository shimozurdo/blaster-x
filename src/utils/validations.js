
/**
 * Validates the if the username is a valid name
 * @param {html elememnt} fld
 * @return {string} error
 */
function validateUsername(fld) {
    let error = "";
    const illegalChars = /\W/; // allow letters, numbers, and underscores
 
    if (fld.value == "") {
        fld.style.background = 'Yellow';
        error = "You didn't enter a \nusername.";       
        return error;
 
    } else if ((fld.value.length < 5) || (fld.value.length > 15)) {
        fld.style.background = 'Yellow';
        error = "The username is the \nwrong length.";		
		return error;
 
    } else if (illegalChars.test(fld.value)) {
        fld.style.background = 'Yellow';
        error = "The username contains \nillegal characters.";		
		return error;
 
    } else if(!/^[a-z]/i.test(fld.value.substring(0, 1))) {
        error = "First character must \nbe a letter";		
		return error;
    } else {
        fld.style.background = 'White';
    }
    return error;
}

export {
    validateUsername
}