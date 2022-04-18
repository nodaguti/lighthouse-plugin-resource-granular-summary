const URL = require('url').URL;

const ResourceSummary = require('lighthouse/lighthouse-core/computed/resource-summary');
const URLShim = require('lighthouse/lighthouse-core/lib/url-shim');
const { Util } = require('lighthouse/lighthouse-core/util-commonjs');

function isFavicon(record) {
  const type = ResourceSummary.determineResourceType(record);

  if (type === 'other' && record.url.endsWith('/favicon.ico')) {
    return true;
  }
}

function isFirstParty(url, mainResourceDomain) {
  return new URL(url).hostname.endsWith(mainResourceDomain);
}

function summarise(networkRecords, mainResourceURL) {
  const summary = {
    stylesheet: {
      firstParty: { count: 0, resourceSize: 0, transferSize: 0 },
      thirdParty: { count: 0, resourceSize: 0, transferSize: 0 },
    },
    image: {
      firstParty: { count: 0, resourceSize: 0, transferSize: 0 },
      thirdParty: { count: 0, resourceSize: 0, transferSize: 0 },
    },
    media: {
      firstParty: { count: 0, resourceSize: 0, transferSize: 0 },
      thirdParty: { count: 0, resourceSize: 0, transferSize: 0 },
    },
    font: {
      firstParty: { count: 0, resourceSize: 0, transferSize: 0 },
      thirdParty: { count: 0, resourceSize: 0, transferSize: 0 },
    },
    script: {
      firstParty: { count: 0, resourceSize: 0, transferSize: 0 },
      thirdParty: { count: 0, resourceSize: 0, transferSize: 0 },
    },
    document: {
      firstParty: { count: 0, resourceSize: 0, transferSize: 0 },
      thirdParty: { count: 0, resourceSize: 0, transferSize: 0 },
    },
    other: {
      firstParty: { count: 0, resourceSize: 0, transferSize: 0 },
      thirdParty: { count: 0, resourceSize: 0, transferSize: 0 },
    },
    total: {
      firstParty: { count: 0, resourceSize: 0, transferSize: 0 },
      thirdParty: { count: 0, resourceSize: 0, transferSize: 0 },
    },
  };

  networkRecords
    .filter((record) => {
      if (isFavicon(record) || URLShim.isNonNetworkProtocol(record.url)) {
        return false;
      }

      return true;
    })
    .forEach((record) => {
      const type = ResourceSummary.determineResourceType(record);
      const mainResourceDomain = Util.getRootDomain(mainResourceURL);
      const party = isFirstParty(record.url, mainResourceDomain)
        ? 'firstParty'
        : 'thirdParty';

      summary[type][party].count++;
      summary[type][party].resourceSize += record.resourceSize;
      summary[type][party].transferSize += record.transferSize;

      summary.total[party].count++;
      summary.total[party].resourceSize += record.resourceSize;
      summary.total[party].transferSize += record.transferSize;
    });

  return summary;
}

module.exports = summarise;
