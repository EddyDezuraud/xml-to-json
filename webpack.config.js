const path = require('path');

module.exports = {
    entry: './script.js',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'public'), // Update path here
    },
    module: {
        rules: [
            {
                test: /\.xml$/,
                use: 'xml-loader',
            },
        ],
    },
    optimization: {
        minimize: false
    }
};
