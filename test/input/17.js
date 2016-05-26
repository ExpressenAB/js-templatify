if (depth > 20) { // Not too large, not too small
  return callback(new Error("mapReference too deep on " + ref.id));
}