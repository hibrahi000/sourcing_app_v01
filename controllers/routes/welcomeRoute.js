module.exports = (imports) =>{

    let {app,urlencodedParser} = imports;
	app.get('/', urlencodedParser, (req, res) => {
		res.render('welcome');
    });
}