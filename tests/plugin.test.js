const fs = require('fs');

const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');
const jsonpath = require('jsonpath');

let chrome;

beforeAll(async () => {
  chrome = await chromeLauncher.launch({
    chromeFlags: ['--headless', '--no-sandbox'],
  });
});

afterAll(async () => {
  await chrome.kill();
});

test('Collects network records and summarises them', async () => {
  const options = {
    logLevel: 'error',
    output: 'json',
    plugins: ['lighthouse-plugin-resource-granular-summary'],
    onlyCategories: ['lighthouse-plugin-resource-granular-summary'],
    port: chrome.port,
  };
  const runnerResult = await lighthouse('https://www.google.com', options);
  const lhrResult = runnerResult.lhr;

  const resourceTypesExpected = [
    'stylesheet',
    'image',
    'media',
    'font',
    'script',
    'document',
    'other',
    'total',
  ];

  const resourceTypes = jsonpath.query(
    lhrResult,
    "$['audits']['resource-granular-summary']['details']['items']..['resourceType']",
  );

  expect(resourceTypes).toEqual(expect.arrayContaining(resourceTypesExpected));

  const scriptResults = jsonpath.query(
    lhrResult,
    "$['audits']['resource-granular-summary']['details']['items']..[?(@.resourceType=='script')]",
  );
  const scriptParties = jsonpath.query(
    lhrResult,
    "$['audits']['resource-granular-summary']['details']['items']..[?(@.resourceType=='script')]['party']",
  );

  expect(scriptResults).toHaveLength(2);
  expect(scriptParties).toEqual(expect.arrayContaining(['1st', '3rd']));
  expect(Object.keys(scriptResults[0])).toEqual(
    expect.arrayContaining(['requestCount', 'transferSize', 'resourceSize']),
  );
  expect(scriptResults[0].requestCount).toBeGreaterThan(0);
  expect(scriptResults[0].transferSize).toBeGreaterThan(0);
  expect(scriptResults[0].resourceSize).toBeGreaterThan(0);
});
