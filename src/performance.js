import cluster from 'cluster';
import express from 'express';
import os from 'os';

const numWorkers = os.cpus().length;

if(cluster.isMaster) {
	console.log(`Master cluster setting up ${numWorkers} workers...`);

	for(var i = 0; i < numWorkers; i++) {
		cluster.fork();
	}

	cluster.on('online', (worker) => console.log(`Worker ${worker.process.pid} is online`));

	cluster.on('exit', (worker, code, signal) => {
		console.log(`Worker ${worker.process.pid} died with code: ${code} and signal: ${signal}`);
		console.log('Starting a new worker');
		cluster.fork();
	});
} else {
	const app = express();
	app.all('/*', (req, res) => {
		for (var i = 0; i < 999999; i++) {}
		res.send(`process ${process.pid}`).end();
	});

	app.listen(9000, () => console.log(`Process ${process.pid} is listening to all incoming requests`));
}