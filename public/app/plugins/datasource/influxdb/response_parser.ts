import _ from 'lodash';

export default class ResponseParser {
  parse(query, results) {
    if (!results || results.results.length === 0) {
      return [];
    }

    var influxResults = results.results[0];
    if (!influxResults.series) {
      return [];
    }

    var res = {};
    _.each(influxResults.series, serie => {
      _.each(serie.values, value => {
        if (_.isArray(value)) {
          // In general, there are 2 possible shapes for the returned value.
          // The first one is a two-element array,
          // where the first element is somewhat a metadata value:
          // the tag name for SHOW TAG VALUES queries,
          // the time field for SELECT queries, etc.
          // The second shape is an one-element array,
          // that is containing an immediate value.
          // For example, SHOW FIELD KEYS queries return such shape.
          // Note, pre-0.11 versions return
          // the second shape for SHOW TAG VALUES queries
          // (while the newer versions—first).
          if (value[1] !== undefined) {
            addUnique(res, value[1]);
          } else {
            addUnique(res, value[0]);
          }
        } else {
          addUnique(res, value);
        }
      });
    });

    return _.map(res, value => {
      return { text: value.toString() };
    });
  }
}

function addUnique(arr, value) {
  arr[value] = value;
}
