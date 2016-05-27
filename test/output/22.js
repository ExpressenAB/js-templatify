function myFunc(url) {
  if (url.match(/\//)) {
    return url.substr(0, url.length - 3);
  } else {
    return `${url}/`;
  }
}