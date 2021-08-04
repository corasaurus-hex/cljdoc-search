window.docsetSearch = {};
window.docsetSearch.updateResults = () => {
  const resultsContainer = document.getElementById("results");
  const queryInput = document.getElementById("query");
  const results = window.docsetSearch.index.search(queryInput.value, { enrich: true });

  const children = results.map((r) => {
    const fieldContainer = document.createElement('div');
    const fieldHeader = document.createElement('h2');
    fieldHeader.innerText = r.field;
    fieldContainer.appendChild(fieldHeader);
    r.result.forEach((d) => {
      const pTag = document.createElement('p');
      const preTag = document.createElement('pre');
      const codeTag = document.createElement('code');
      codeTag.innerText = JSON.stringify(d, null, 2);
      preTag.appendChild(codeTag);
      pTag.appendChild(preTag);
      fieldContainer.appendChild(pTag);
    });
    return fieldContainer;
  });
  resultsContainer.replaceChildren(...children);
}

document.addEventListener('DOMContentLoaded', () => {
  fetch("./data.json").then((response) => {
    if (response.ok) {
      console.log("got an ok response");
      const startTime = (new Date()).getTime();

      response.json().then((json) => {
        console.log("parsed json, now indexing");
        const index = new FlexSearch.Document({
          document: {
            id: "id",
            index: ["name", "doc"],
            store: true
          },
          tokenize: "forward",
          context: true
        });

        window.docsetSearch.documents = json["defs"].concat(json["namespaces"]);

        for (const [i, doc] of window.docsetSearch.documents.entries()) {
          index.add(Object.assign({ id: i }, doc));
        }

        window.docsetSearch.index = index;

        const endTime = (new Date()).getTime();
        console.log("all indexed", (endTime - startTime));

        document.getElementById("query").addEventListener('keyup', debounce(window.docsetSearch.updateResults));
      })
    } else {
      console.log("bad response loading data", response);
    }
  });
});