const fs = require('fs');
const path = require('path');
const stripComments = require('strip-comments');

function walk(dir, callback) {
    fs.readdir(dir, (err, files) => {
        if (err) throw err;
        files.forEach(file => {
            const filepath = path.join(dir, file);
            fs.stat(filepath, (err, stats) => {
                if (stats.isDirectory()) {
                    walk(filepath, callback);
                } else if (stats.isFile()) {
                    if (filepath.endsWith('.ts') || filepath.endsWith('.tsx') || filepath.endsWith('.js') || filepath.endsWith('.jsx')) {
                        callback(filepath);
                    }
                }
            });
        });
    });
}

const targetDir = path.join(__dirname, 'src');

walk(targetDir, (filepath) => {
    fs.readFile(filepath, 'utf8', (err, data) => {
        if (err) {
            console.error(`Error reading ${filepath}:`, err);
            return;
        }

        try {
            // stripComments removes both inline and block comments from JS/TS/JSX/TSX
            const stripped = stripComments(data);

            // Clean up multiple empty lines that might have been left behind by removed comments
            const cleaned = stripped.replace(/^\s*[\r\n]/gm, '\n').replace(/\n{3,}/g, '\n\n');

            if (data !== cleaned) {
                fs.writeFile(filepath, cleaned, 'utf8', (err) => {
                    if (err) {
                        console.error(`Error writing ${filepath}:`, err);
                    } else {
                        console.log(`Cleaned: ${filepath}`);
                    }
                });
            }
        } catch (e) {
            console.error(`Error processing ${filepath}:`, e);
        }
    });
});
