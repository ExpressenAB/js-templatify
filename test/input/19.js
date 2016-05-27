function mapToplist(param1, param2, req) {
  return {
    param1: param1,
    self: someFunc(req) + "/" + param1 + appendQuerystring(req.query),
    count: param2.length
  };
}