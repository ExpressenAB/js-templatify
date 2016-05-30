repo.get(function (err, source) {
  res.setHeader("cache-control", "public, max-age=" + maxAge(source, mapped));
});