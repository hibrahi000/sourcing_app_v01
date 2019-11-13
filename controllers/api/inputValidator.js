const checkFormat = (array) => {
	array = array.join('');
	let checks = [ ' ', '-', '+', ',' ];
	let valid = true;
	checks.forEach((c) => {
		if (array.indexOf(c) === -1) {
			console.log(`Check: '${c}' PASS`);
			valid = false;
		} else {
			console.log(`Check: ${c} FAIL`);
		}
	});
	return valid;
};

const checkFormatAndToUpperCase = (array) => {
	return { array: array.map((e) => e.toUpperCase()), valid: checkFormat(array) };
};

module.exports = {
	checkFormatAndToUpperCase: checkFormatAndToUpperCase,
	checkFormat: checkFormat
};
