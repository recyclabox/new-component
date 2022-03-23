#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const program = require('commander');
const {
  getConfig,
  buildPrettifier,
  logIntro,
  logItemCompletion,
  logConclusion,
  logError,
} = require('./helpers');
const {
  mkDirPromise,
  readFilePromise,
  writeFilePromise,
} = require('./utils');

// Load our package.json, so that we can pass the version onto `commander`.
const { version } = require('../package.json');

// Get the default config for this component (looks for local/global overrides,
// falls back to sensible defaults).
const config = getConfig();

// Convenience wrapper around Prettier, so that config doesn't have to be
// passed every time.
const prettify = buildPrettifier(config.prettierConfig);

program
  .version(version)
  .arguments('<componentName>')
  .option(
    '-d, --dir <pathToDirectory>',
    'Path to the "components" directory (default: "current directory")',
    config.dir
  )
  .parse(process.argv);

const [componentName] = program.args;
const dir = path.join(__dirname, program.dir)

// Find the path to the selected template file.
const templatePath = (name, ext) => {
  const { dirname } = require('path');
  const appDir = dirname(require.main.filename);
  return `${appDir}/templates/${name}.${ext}`;
}

// Get all of our file paths worked out, for the user's project.
const componentDir = `${dir}/${componentName}`;

const files = {
  index: {
    name: `index`,
    ext: 'ts',
  },
  component: {
    name: `${componentName}`,
    ext: 'tsx',
  },
  types: {
    name: `${componentName}.types`,
    ext: 'ts',
  },
  utils: {
    name: `${componentName}.utils`,
    ext: 'ts',
  },
  hook: {
    name: `use${componentName}.hook`,
    ext: 'ts',
  },
  test: {
    name: `${componentName}.test`,
    ext: 'ts',
  },
  content: {
    name: `${componentName}.content.en`,
    ext: 'json',
  },
}

logIntro({ name: componentName });

// Check if componentName is provided
if (!componentName) {
  logError(
    `Sorry, you need to specify a name for your component like this: rnc <name>`
  );
  process.exit(0);
}

// Check to see if a directory at the given path exists
const fullPathToParentDir = path.resolve(dir);
if (!fs.existsSync(fullPathToParentDir)) {
  logError(
    `Unable to create component, failed when looking for a directory at ${dir}).`
  );
  process.exit(0);
}

// Check to see if this component has already been created
const fullPathToComponentDir = path.resolve(componentDir);
if (fs.existsSync(fullPathToComponentDir)) {
  logError(
    `Looks like this component already exists! There's already a component at ${componentDir}.\nPlease delete this directory and try again.`
  );
  process.exit(0);
}

function createFles(files) {
  // loop through the files array
  return Object.entries(files).reduce((p, [key, {name: fileName, ext}]) => p
    .then(() => {
      // Get the contents of the template file.
      return readFilePromise(templatePath(key, ext))
    })
    .then((template) => {
      // Replace our placeholders with real data (so far, just the component name)
      return template.replace(/COMPONENT_NAME/g, componentName)
    })
    .then((template) => {
      // Format it using prettier, to ensure style consistency, and write to file.
      const filePath = `${componentDir}/${fileName}.${ext}`;
      return writeFilePromise(filePath, ext === 'json' ? template : prettify(template))
    }
    )
    .then((template) => {
      logItemCompletion(`${key} file built and saved to disk.`)
      return template
    })
  , Promise.resolve() );
} 

mkDirPromise(componentDir)
  .then(() => 
    logItemCompletion('Directory created.', `(${componentDir})`)
  )
  .then(() => 
    createFles(files)
  )
  .then(() => logConclusion())
  .catch((err) => console.error(err));
