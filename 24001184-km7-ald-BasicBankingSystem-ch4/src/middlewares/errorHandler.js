const errorHandler = (error, req, res, next) => {
	console.error(error.stack);
	res.status(500).json({
		status: "Failed",
		message: "There's Something Wrong with The Server!",
	});
};

module.exports = errorHandler;
