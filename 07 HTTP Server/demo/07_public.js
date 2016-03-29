'use strict';

const http = require('http');
const fs = require('fs');
const url = require('url');
const path = require('path');
const mime = require('../ss/mime.json');
const handlebars = require('handlebars');
const public_folder = path.join(__dirname, 'node_modules');

let server = http.createServer(function(req, res){
    let pathName = url.parse(req.url).pathname,
        realPath = path.join(public_folder, pathName);

    fs.stat(realPath, (err, stats) => {
        if(err){ // file do not exists
            let source = fs.readFileSync('./template/404.tmpl'),
                template = handlebars.compile(source.toString()),
                data = {
                    path: path.basename(url.parse(req.url).pathname)
                };

            res.writeHead(404, {
                'Content-Type': 'text/html'
            });
            res.end(template(data));
        }else{
            if(stats.isDirectory()){
                let source = fs.readFileSync('./template/directory.tmpl'),
                    template = handlebars.compile(source.toString()),
                    data = {
                        title: url.parse(req.url).name,
                        path: path.join(pathName, '/'),
                        files: []
                    };

                data.files = fs.readdirSync(realPath);

                res.writeHead(200, {
                    'Content-Type': 'text/html'
                });
                res.end(template(data));
            }else{
                let extension = path.extname(pathName).replace('.', ''),
                    fileType = mime[extension] || 'text/plain';

                res.writeHead(200, {
                    'Content-Type': fileType
                });
                fs.createReadStream(realPath).pipe(res);
            }
        }
    });
});

server.listen(process.argv[2] || 9000);
