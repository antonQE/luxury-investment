export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'scope-enum': [2, 'always', ['web', 'admin', 'api', 'shared', 'infra', 'docs', 'e2e']],
  },
};
