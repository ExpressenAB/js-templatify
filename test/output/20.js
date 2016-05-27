if (response.statusCode !== 200) {
  throw new Error(`Bad response code ${response.statusCode} from back-end`);
}