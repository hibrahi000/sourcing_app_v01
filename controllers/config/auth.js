function adminEnsureAuthenticated(req, res, next) {
	// console.log('i started');
	if (req.isAuthenticated()) {
		return next();
	}
	console.log('error here');
	req.flash('error_msg', 'Please log in to use your Admin Account');
	res.redirect('/ABH_Admin/Login');
}

function purchEnsureAuthenticated(req, res, next) {
	// console.log('i started');
	if (req.isAuthenticated()) {
		return next();
	}
	req.flash('error_msg', 'Please log into your Account');
	res.redirect('/ABH_Purchase/Login');
}
function vendEnsureAuthenticated(req, res, next) {
	// console.log('i started');
	if (req.isAuthenticated()) {
		return next();
	}

	res.redirect('https://abhpharma.com/');
}

module.exports = {
	vendEnsureAuthenticated: vendEnsureAuthenticated,
	adminEnsureAuthenticated: adminEnsureAuthenticated,
	purchEnsureAuthenticated: purchEnsureAuthenticated
};
