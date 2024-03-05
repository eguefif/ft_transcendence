

function isValidName(email) {
	const regex = /^[a-zA-Z\d]{4,24}$/;
	return regex.test(email);
}

function isValidEmail(email) {
	const regex = /^[\w\-\.]+@([\w\-]+\.)+[\w\-]{2,4}$/;
	return regex.test(email);
}

function checkFirstName() {
    const firstName = document.getElementById('profileFirstName').value;
    if (firstName === '') {
        document.getElementById('firstNameError').textContent = 'your first name cannot be empty';
        return false;
    }
	else if (!isValidName(firstName)) {
		document.getElementById('firstNameError').textContent = 'Your first name must have between 4-24 characters, only letters and numbers.';
        return false;
	}
    document.getElementById('firstNameError').textContent = '';
    return true;
}

function checkLastName() {
    const lastName = document.getElementById('profileLastName').value;
    if (lastName === '') {
        document.getElementById('lastNameError').textContent = 'your last name cannot be empty';
        return false;
    }
	else if (!isValidName(lastName)) {
		document.getElementById('lastNameError').textContent = 'Your last name must have between 4-24 characters, only letters and numbers.';
        return false;
	}
    document.getElementById('lastNameError').textContent = '';
    return true;
}

function checkEmail() {
    const email = document.getElementById('profileEmail').value;
    if (email === '') {
        document.getElementById('emailError').textContent = 'your email cannot be empty';
        return false;
    } else if (!isValidEmail(email)) {
        document.getElementById('emailError').textContent = 'Your email is not a valid email ("exemple@domaine.exp").';
        return false;
    }
    document.getElementById('emailError').textContent = '';
    return true;
}

export function validateForm() {
    const isFirstNameValid = checkFirstName();
    const isLastNameValid = checkLastName();
    const isEmailValid = checkEmail();
    return isFirstNameValid && isEmailValid && isLastNameValid;
}