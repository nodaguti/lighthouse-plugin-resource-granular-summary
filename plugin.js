module.exports = {
  audits: [
    {
      path:
        'lighthouse-plugin-resource-granular-summary/audits/resource-granular-summary.js',
    },
  ],
  category: {
    title: 'Resources',
    auditRefs: [{ id: 'resource-granular-summary', weight: 1 }],
  },
};
