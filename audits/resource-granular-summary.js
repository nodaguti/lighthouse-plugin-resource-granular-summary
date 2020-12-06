const { Audit, NetworkRecords } = require('lighthouse');
const MainResource = require('lighthouse/lighthouse-core/computed/main-resource');

const summarise = require('../lib/summarise_resources');

class ResourceGranularSummaryAudit extends Audit {
  static get meta() {
    return {
      id: 'resource-granular-summary',
      title: 'Granular summary of network resources',
      description: 'A slightly more granular summary of network resources.',
      requiredArtifacts: ['devtoolsLogs', 'URL'],
    };
  }

  static async audit(artifacts, context) {
    const devtoolsLog = artifacts.devtoolsLogs[Audit.DEFAULT_PASS];
    const URL = artifacts.URL;
    const [networkRecords, mainResource] = await Promise.all([
      NetworkRecords.request(devtoolsLog, context),
      MainResource.request({ devtoolsLog, URL }, context),
    ]);

    const summary = summarise(networkRecords, mainResource.url);

    const headings = [
      { key: 'resourceType', itemType: 'text', text: 'Resource Type' },
      { key: 'party', itemType: 'text', text: '1st/3rd Party' },
      { key: 'requestCount', itemType: 'numeric', text: 'Request Count' },
      { key: 'transferSize', itemType: 'bytes', text: 'Transfer Size' },
      { key: 'resourceSize', itemType: 'bytes', text: 'Resource Size' },
    ];
    const rows = Object.keys(summary).reduce((acc, type) => {
      return acc.concat([
        {
          resourceType: type,
          party: '1st',
          requestCount: summary[type].firstParty.count,
          transferSize: summary[type].firstParty.transferSize,
          resourceSize: summary[type].firstParty.resourceSize,
        },
        {
          resourceType: type,
          party: '3rd',
          requestCount: summary[type].thirdParty.count,
          transferSize: summary[type].thirdParty.transferSize,
          resourceSize: summary[type].thirdParty.resourceSize,
        },
      ]);
    }, []);
    const table = Audit.makeTableDetails(headings, rows);

    return {
      details: table,
      score: 1,
    };
  }
}

module.exports = ResourceGranularSummaryAudit;
