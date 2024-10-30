const isEmpty = (fields) => {
	return fields.some((field) => !field || field.trim() === "");
};

const isGmail = (email) => {
	return email.endsWith("@gmail.com");
};

const isNumber = (input) => {
	return !isNaN(input) && !isNaN(parseFloat(input));
};

const isPasswordVaild = (password) => {
	return password.length >= 8;
};

module.exports = { isEmpty, isGmail, isNumber, isPasswordVaild };
