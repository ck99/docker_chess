let main = (http => {
    function readHttp() {
        return new Promise(function(resolve, reject) {
            var req = http.request('http://lczero.org/networks/', function(res) {
                // reject on bad status
                if (res.statusCode < 200 || res.statusCode >= 300) {
                    return reject(new Error('statusCode=' + res.statusCode));
                }
                // cumulate data
                var body = [];
                res.on('data', function(chunk) {
                    body.push(chunk);
                });
                // resolve on end
                res.on('end', function() {
                    resolve(body);
                });
            });
            // reject on request error
            req.on('error', function(err) {
                // This is not a "Second reject", just a different sort of failure
                reject(err);
            });
            // IMPORTANT
            req.end();
        });
    }

    function filesystem() {
        return new Promise(function(resolve, reject) {
            var fs = require('fs');
            resolve(fs.readFileSync(__dirname + '/networks.html', 'utf8'));
        })
    }

    let getHeader = (html) => {
        let header = [];
        let i = 0;
        while(!html[i].match(/<thead>/)) {
            i++;
        }
        i++; // skip opening tbody
        while(!html[i].match(/<\/thead>/)) {
            if(html[i].match(/\s*<th>(.*)<\/th>\s*/)) {
                header.push(html[i].replace(/\s*<th>(.*)<\/th>\s*/, "$1"))
            }
            i++;
        }

        return header;
    };

    let getBody = (html) => {
        let body = [];
        let i = 0;
        while(!html[i].match(/<tbody>/)) {
            i++;
        }
        i++; // skip opening tbody
        while(!html[i].match(/<\/tbody>/)) {
            if(!html[i].match(/^\s*$/)) {
                body.push(html[i])
            }
            i++;
        }

        return body;
    };

    let transformers = {
        Network: (s) => {
            return s.replace(/.*sha=([0-9a-f]+).*/, "$1");
        },
        Time: (s) => {
            return s.replace(/\s*&#43;.*/, "");
        },
        Elo: (s) => {
            return Math.round((0.6*s) - 511.7);
        }
    };

    let getRows = (body, header) => {
        let rows = [];
        let i = 0;
        let j = 0;
        let row = {};
        do {
            if(body[i].match(/<tr>/)) {
                row = {};
                j = 0;
            } else if(body[i].match(/<\/tr>/)) {
                rows.push(row);
            } else {
                let transformer = (s) => 1*s;
                if(transformers[header[j]]) {
                    transformer = transformers[header[j]];
                }
                row[header[j]] = transformer(body[i].replace(/\s*<td>(.*)<\/td>\s*/, "$1"));
                j++;
            }
            i++;
        } while(i < body.length);

        return rows;
    };

    function parser (resp) {
        let html = resp.toString().split("\n");
        let rows = getRows(getBody(html), getHeader(html));

        return new Promise((resolve, reject) => {
            resolve(rows);
        })
    }

    return {
        http: readHttp,
        fs: filesystem,
        parser: parser
    }
})(require('http'));



main.http()
    .then(main.parser)
    .then(rows => {
        let elos = [];
        for(let x = 100; x < 2200; x+=100) {
            elos.push(x);
        }
        let targets = {};

        let eloSeek = (target, current, candidate) => {
            let cuDiff = Math.abs(current.Elo - target);
            let caDiff = Math.abs(candidate.Elo - target);

            if(cuDiff < caDiff) {
                return current;
            } else {
                return candidate;
            }
        };

        rows.forEach(r => {
            elos.forEach(e => {
                if(!targets[e]) {
                    targets[e] = r;
                } else {
                    targets[e] = eloSeek(e, targets[e], r);
                }
            })
        })

        console.log(targets['800']);
    })
    .catch(err => {
    console.log(err)
});



