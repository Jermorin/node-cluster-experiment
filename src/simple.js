import cluster from 'cluster';
import http from 'http';
const numCPU = 4;

if (cluster.isMaster) {
    for (var i = 0; i < numCPU; i++) {
        cluster.fork();
    }
} else {
    http.createServer((req, res) => {
        res.writeHead(200);
        res.end(`process ${process.pid}`);
    }).listen(9000);
}
