const app = require('express')();

app.get('/webhook', (req, res) => {
  res.end('Hello');
});

app.listen(3000, () => {
    console.log(`Example app listening on port ${3000}`)
})
