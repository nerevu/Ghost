const should = require('should');
const url = require('url');
const sinon = require('sinon');
const models = require('../../../core/server/models');
const testUtils = require('../../utils');
const {knex} = require('../../../core/server/data/db');

describe('Unit: models/integration', function () {
    afterEach(function () {
        sinon.restore();
    });

    describe('permittedOptions', function () {
        let basePermittedOptionsReturnVal;
        let basePermittedOptionsStub;

        beforeEach(function () {
            basePermittedOptionsReturnVal = ['super', 'doopa'];
            basePermittedOptionsStub = sinon.stub(models.Base.Model, 'permittedOptions')
                .returns(basePermittedOptionsReturnVal);
        });

        it('returns the base permittedOptions result', function () {
            const returnedOptions = models.Integration.permittedOptions();
            should.deepEqual(returnedOptions, basePermittedOptionsReturnVal);
        });

        it('returns the base permittedOptions result plus "filter" when methodName is findOne', function () {
            const returnedOptions = models.Integration.permittedOptions('findOne');
            should.deepEqual(returnedOptions, basePermittedOptionsReturnVal.concat('filter'));
        });
    });

    describe('findOne', function () {
        const mockDb = require('mock-knex');
        let tracker;

        before(function () {
            mockDb.mock(knex);
            tracker = mockDb.getTracker();
        });

        after(function () {
            mockDb.unmock(knex);
        });

        it('generates correct query (allows use of options.filter)', function () {
            const queries = [];
            tracker.install();

            tracker.on('query', (query) => {
                queries.push(query);
                query.response([]);
            });

            return models.Integration.findOne({
                id: '123'
            }, {
                filter: 'type:[custom,builtin]'
            }).then(() => {
                queries.length.should.eql(1);
                queries[0].sql.should.eql('select `integrations`.* from `integrations` where `integrations`.`type` in (?, ?) and `integrations`.`id` = ? limit ?');
                queries[0].bindings.should.eql(['custom', 'builtin', '123', 1]);
            });
        });
    });
});
