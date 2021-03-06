'use strict';

const test = require('tape');
const proxyquire = require('proxyquire');

test('nodeshift-config basic setup', (t) => {
  const nodeshiftConfig = proxyquire('../lib/nodeshift-config', {
    'openshift-config-loader': () => {
      return Promise.resolve({
        context: {
          namespace: 'test-namespace'
        },
        cluster: 'http://mock-cluster'
      });
    },
    'openshift-rest-client': () => { return Promise.resolve({}); }
  });

  const p = nodeshiftConfig().then((config) => {
    t.ok(config.port, 'port prop should be here');
    t.equal(config.port, 8080, 'default port should be 8080');
    t.ok(config.projectLocation, 'projectLocation prop should be here');
    t.equal(config.projectLocation, process.cwd(), 'projectLocation prop should be cwd by default');
    t.ok(config.nodeshiftDirectory, 'nodeshiftDir prop should be here');
    t.equal(config.nodeshiftDirectory, '.nodeshift', 'nodeshiftDir prop should be .nodeshift by default');
    t.end();
  }).catch(t.fail);

  t.equal(p instanceof Promise, true, 'should return a Promise');
});

test('nodeshift-config basic setup with deploy option', (t) => {
  const nodeshiftConfig = proxyquire('../lib/nodeshift-config', {
    'openshift-config-loader': () => {
      return Promise.resolve({
        context: {
          namespace: 'test-namespace'
        },
        cluster: 'http://mock-cluster'
      });
    },
    'openshift-rest-client': () => { return Promise.resolve({}); }
  });

  const options = {
    deploy: {
      port: 3000
    }
  };

  const p = nodeshiftConfig(options).then((config) => {
    t.ok(config.port, 'port prop should be here');
    t.equal(config.port, 3000, 'default port should be 8080');
    t.end();
  }).catch(t.fail);

  t.equal(p instanceof Promise, true, 'should return a Promise');
});

test('nodeshift-config other project location and nodeshiftDir', (t) => {
  const nodeshiftConfig = proxyquire('../lib/nodeshift-config', {
    'openshift-config-loader': () => {
      return Promise.resolve({
        context: {
          namespace: 'test-namespace'
        },
        cluster: 'http://mock-cluster'
      });
    },
    'openshift-rest-client': () => { return Promise.resolve({}); }
  });

  const options = {
    projectLocation: '../examples/sample-project'
  };

  nodeshiftConfig(options).then((config) => {
    t.equal(config.projectLocation, '../examples/sample-project', 'projectLocation prop should be changed');
    t.end();
  });
});

test('nodeshift-config no project Version', (t) => {
  const nodeshiftConfig = proxyquire('../lib/nodeshift-config', {
    'openshift-config-loader': () => {
      return Promise.resolve({
        context: {
          namespace: 'test-namespace'
        },
        cluster: 'http://mock-cluster'
      });
    },
    'openshift-rest-client': () => { return Promise.resolve({}); }
  });

  const options = {
    projectLocation: '../examples/sample-project-no-version'
  };

  nodeshiftConfig(options).then((config) => {
    t.equal(config.projectVersion, '0.0.0', 'projectVersion should be 0.0.0');
    t.end();
  });
});

test('nodeshift-config no package.json', (t) => {
  const nodeshiftConfig = proxyquire('../lib/nodeshift-config', {
    'openshift-config-loader': () => {
      return Promise.resolve({
        context: {
          namespace: 'test-namespace'
        },
        cluster: 'http://mock-cluster'
      });
    },
    'openshift-rest-client': () => { return Promise.resolve({}); }
  });

  const options = {
    projectLocation: './not-here'
  };

  nodeshiftConfig(options).catch((err) => {
    t.equal(err.message.includes('Cannot find module \'./not-here/package.json\''), true, 'Error Should be "\'Cannot find module \'./not-here/package.json\'\'"');
    t.end();
  });
});

test('nodeshift-config invalid "name" in package.json', (t) => {
  const nodeshiftConfig = proxyquire('../lib/nodeshift-config', {
    'openshift-config-loader': () => {
      return Promise.resolve({
        context: {
          namespace: 'test-namespace'
        },
        cluster: 'http://mock-cluster'
      });
    },
    'openshift-rest-client': () => { return Promise.resolve({}); }
  });

  const tmpDir = require('os').tmpdir();
  const join = require('path').join;
  const fs = require('fs');

  const options = {
    projectLocation: join(tmpDir, 'nodeshift-invalid-package-name-test')
  };

  if (!fs.existsSync(options.projectLocation)) {
    fs.mkdirSync(options.projectLocation);
  }

  // Create a temp package that has an invalid name, but extends the example JSON
  fs.writeFileSync(
    join(options.projectLocation, 'package.json'),
    JSON.stringify(
      Object.assign(
        {},
        require('../examples/sample-project/package.json'),
        {
          name: '@invalid-package-name'
        }
      )
    )
  );

  nodeshiftConfig(options).catch((err) => {
    t.equal(err.message.includes('"name" in package.json can only consist lower-case letters, numbers, and dashes. It must start with a letter and can\'t end with a -.'), true);
    t.end();
  });
});

test('nodeshift-config options for the config loader', (t) => {
  const nodeshiftConfig = proxyquire('../lib/nodeshift-config', {
    'openshift-config-loader': (options) => {
      t.ok(options.tryServiceAccount, 'tryServiceAccount should be there');
      t.ok(options.configLocation, 'configLocation should be there');
      return Promise.resolve({
        context: {
          namespace: 'test-namespace'
        },
        cluster: 'http://mock-cluster'
      });
    },
    'openshift-rest-client': () => { return Promise.resolve({}); }
  });

  const options = {
    configLocation: '../examples/sample-project',
    tryServiceAccount: true
  };

  nodeshiftConfig(options).then((config) => {
    t.ok(config.tryServiceAccount, 'tryServiceAccount should be there');
    t.ok(config.configLocation, 'configLocation should be there');
    t.end();
  });
});

test('nodeshift-config options for the config loader - change the namespace', (t) => {
  const nodeshiftConfig = proxyquire('../lib/nodeshift-config', {
    'openshift-config-loader': (options) => {
      return Promise.resolve({
        context: {
          namespace: 'test-namespace'
        },
        cluster: 'http://mock-cluster'
      });
    },
    'openshift-rest-client': () => { return Promise.resolve({}); }
  });

  const options = {
    namespace: 'foo'
  };

  nodeshiftConfig(options).then((config) => {
    t.equal(config.namespace, options.namespace, 'namespace should be changed');
    t.end();
  });
});
