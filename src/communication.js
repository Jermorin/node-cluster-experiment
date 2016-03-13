import cluster from 'cluster';
import os from 'os';

const numWorkers = os.cpus().length;
const factorial = (num) => {
    if (num === 1 || num === 0) return 1;
    else return num * factorial(num - 1);
};

class Message{
    constructor({from, type, data: {result, number}}){
        this.from = from;
        this.type = type;
        this.data = {result, number};
        this.toString();
    }

    toString(){
        console.log(`${this.from} : ${this.type} : ${this.data.number} = ${this.data.result}`)
    }
}


if (cluster.isMaster) {

    console.log(`Master cluster setting up ${numWorkers} workers...`);

    for (var i = 0; i < numWorkers; i++) {
        let worker = cluster.fork();
        worker.on('message', message => new Message(message));
    }

    cluster.on('online', worker => console.log(`Worker ${worker.process.pid} is online`));

    for (var wid in cluster.workers) {
        let number = Math.floor(Math.random() * 50);
        let type = 'factorial';
        let from = 'master';
        let data = {number};
        cluster.workers[wid].send({type, from, data});
    }

    cluster.on('exit', (worker, code, signal) => {
        console.log(`Worker ${worker.process.pid} died with code: ${code} and signal: ${signal}`);
        console.log(`Starting a new worker`);
        var worker = cluster.fork();
        worker.on('message', message => new Message());
    });
} else {
    process.on('message', message => {
        if (message.type === 'factorial') {
            const type = 'factorial';
            const from = `Worker ${process.pid}`;
            const number = message.data.number;
            const result = factorial(number);
            const data = {number, result};
            process.send({type, from, data});
        }
    });
}
