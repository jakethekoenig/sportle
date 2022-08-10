const express = require('express');
const app = express();

const port = 8000;

app.get('/', function(req, res)
{
    res.send('test');
});

app.listen(port, () => {
    console.log(`Now listening on port ${port}`);
});
