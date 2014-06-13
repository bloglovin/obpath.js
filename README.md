# ObPath

ObPath matches path expressions against objects, much like jsonpath does.

To install run "npm install -g obpath".

This should allow you to run obpath like this to get books that cost more than 10 simoleons:

```bash
wget "https://raw.githubusercontent.com/bloglovin/obpath.js/master/testdata/data.json"
cat data.json | obp ".store.books[*](gt(@.Price, 10))"
```

Some sample queries:

```js
".store",
".store.books",
".store.*",
"..Author",
".store.counts[*]",
".store.counts[3]",
".store.counts[1:2]",
".store.counts[-2:]",
".store.counts[:1]",
".store.counts[:1].Price",
"..books[*](has(@.ISBN))",
".store.books[*](!empty(@.ISBN))",
".store.books[*](eq(@.Price, 8.99))",
".store.books[0:4](eq(@.Author, \"Louis L'Amour\"))",
"..books.*(between(@.Price, 8, 10)).Title",
"..books[*](gt(@.Price, 9))",
"..books[*](has(@.Metadata))",
"..books[*](contains(@.Title, 'R')).Title",
"..books[*](cicontains(@.Title, 'R')).Title",
".store.*[*](gt(@.Price, 18))"
```

## Programmatic usage

```js
var obpath = require('obpath');

main();

function main() {
  var context = obpath.createContext();

  // Get all trees up until the second last one
  var trees = obpath.mustCompile(".trees[:-2]", context);

  var data = {
    "trees":   ["Elm", "Oak", "Fir"],
    "animals": ["Cat", "Dog", "Horse"]
  };

  var result = trees.evaluate(data);
  result.forEach(function printMatch(match) {
    console.log("Match: ", JSON.stringify(match));
  });
}
```
