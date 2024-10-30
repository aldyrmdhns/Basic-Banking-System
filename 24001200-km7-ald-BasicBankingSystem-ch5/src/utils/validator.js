const isEmpty = (fields) => {
	return fields.some((field) => {
        if (typeof field === 'string') {
            return !field || field.trim() === "";
        }
        return field == null;
    });
};

const isGmail = (email) => {
	return email.endsWith("@gmail.com");
};

const isNumber = (input) => {
	return !isNaN(input) && !isNaN(parseFloat(input));
};

const isPasswordValid = (password) => {
	return password.length >= 8;
};

module.exports = { isEmpty, isGmail, isNumber, isPasswordValid };
