function downloader(data, type, name) {
    let blob = new Blob([data], {type});
    let url = window.URL.createObjectURL(blob);
    downloadURI(url, name);
    window.URL.revokeObjectURL(url);
}

function downloadURI(uri, name) {
    let link = document.createElement("a");
    link.download = name;
    link.href = uri;
    link.click();
}