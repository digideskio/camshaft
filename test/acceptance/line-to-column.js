'use strict';

var assert = require('assert');

var Analysis = require('../../lib/analysis');

var testConfig = require('../test-config');
var QueryRunner = require('../../lib/postgresql/query-runner');

describe('line-to-column analysis', function() {

    var queryRunner;

    before(function() {
        queryRunner = new QueryRunner(testConfig.db);
    });

    var QUERY_SOURCE = 'select * from atm_machines';

    var sourceAtmMachines = {
        type: 'source',
        params: {
            query: QUERY_SOURCE
        }
    };

    var config = testConfig.create({
        batch: {
            inlineExecution: true
        }
    });

    function performAnalysis(definition, callback) {
        Analysis.create(config, definition, function (err, analysis) {
            if (err) {
                return callback(err);
            }

            queryRunner.run(analysis.getQuery(), function(err, result) {
                if (err) {
                    return callback(err);
                }

                assert.ok(Array.isArray(result.rows));
                var values = result.rows.map(function (value) {
                    return value;
                });

                callback(null, values);
            });
        });
    }

    describe('line to column analysis', function () {
        var lineToColumnDefinition = {
            type: 'line-to-column',
            params: {
                source: sourceAtmMachines,
                target_column: 'the_geom_target'
            }
        };

        it('should create analysis', function (done) {
            performAnalysis(lineToColumnDefinition, function (err, values) {
                if(err) {
                    return done(err);
                }

                assert.ok(values);
                assert.ok(values.length > 0);
                values.forEach(function (value) {
                    assert.equal(typeof value.cartodb_id, 'number');
                    assert.ok(value.the_geom);
                    assert.ok(value.length);
                });
                done();
            });
        });
    });
});
