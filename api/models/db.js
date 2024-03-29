const mongoose = require('mongoose');
const logger = require("../config/logger.config");
require("dotenv").config();

const dbURI = process.env.MONGODB_URI;

mongoose.connect(dbURI, {
	useNewUrlParser: true,
	useCreateIndex: true,
	useUnifiedTopology: true
});

mongoose.connection.on('connected', () => {
	console.log("Mongoose connected successfully to database");
});
mongoose.connection.on('error', err => {
	logger.logError(err);
	console.log('Mongoose connection error:', err);
});
mongoose.connection.on('disconnected', () => {
	console.log('Mongoose disconnected');
});

const gracefulShutdown = (msg, callback) => {
	mongoose.connection.close( () => {
		console.log(`Mongoose disconnected through ${msg}`);
		callback();
	});
};

// For nodemon restarts
process.once('SIGUSR2', () => {
	gracefulShutdown('nodemon restart', () => {
		process.kill(process.pid, 'SIGUSR2');
	});
});

// For app termination
process.on('SIGINT', () => {
	gracefulShutdown('app termination', () => {
		process.exit(0);
	});
});

// For Heroku app termination
process.on('SIGTERM', () => {
	gracefulShutdown('Heroku app shutdown', () => {
		process.exit(0);
	});
});

require('./shares');
require('./users');
