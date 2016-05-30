switch (name) {
  case "a":
    return a + ".log";
  case "b":
    return process.stdout;
  default:
    throw new Error("Serious problem");
}