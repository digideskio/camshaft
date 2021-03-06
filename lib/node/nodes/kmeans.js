'use strict';

var Node = require('../node');

var TYPE = 'kmeans';

var PARAMS = {
    source : Node.PARAM.NODE(Node.GEOMETRY.POINT),
    clusters : Node.PARAM.NUMBER()
};

var KMeans = Node.create(TYPE, PARAMS, {cache: true});

module.exports = KMeans;
module.exports.TYPE = TYPE;
module.exports.PARAMS = PARAMS;

var kMeansQueryTemplate = Node.template([
    'select q.*, clusters.cluster_no',
    'from cdb_crankshaft.cdb_KMeans($kmeans_query${{=it.query}}$kmeans_query$,{{=it.clusters}}) clusters,',
    '(select * from ({{=it.query}}) _wrapped order by cartodb_id) q',
    'WHERE q.cartodb_id = clusters.cartodb_id'
].join('\n'));

KMeans.prototype.sql = function(){
    return kMeansQueryTemplate({
        query : this.source.getQuery(),
        clusters : this.clusters
    });
};
