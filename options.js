import Alias from "/src/logic/alias.js";
import AliasController from "/src/logic/alias_controller.js";

const alias_controller = AliasController.get_instance();

document.addEventListener('DOMContentLoaded', () => {
  const saveAliasesToFileButton = document.getElementById('saveAliasesToFile');
  const loadAliasesFromFileInput = document.getElementById('loadAliasesFromFile');

  saveAliasesToFileButton.addEventListener('click', async () => {
    const aliases = await alias_controller.get_aliases();
    let text = '';
    for (const alias of aliases) {
      text += `${alias.name} ${alias.url}\n`;
    }
    const filename = 'url_aliases.txt';
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    chrome.downloads.download({
      url: url,
      filename: filename,
    });
    URL.revokeObjectURL(url);
  });

  loadAliasesFromFileInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const text = e.target.result;
        const merge = document.getElementById('merge').checked;
        const lines = text.split('\n').map(line => line.trim()).filter(line => line.includes(' '));
        const new_aliases = [];
        for (const line of lines) {
          const parts = line.split(' ');
          if (parts.length >= 2) {
            const alias_array = parts.slice(0, parts.length - 1);
            const id = -1;
            const name = alias_array.join(' ');
            const url = parts[parts.length - 1];
            if (name && url) {
              new_aliases.push(new Alias(id, name, url));
            }
          }
        }
        await merge_or_replace_aliases(new_aliases, merge);
      }
      reader.readAsText(file);
      loadAliasesFromFileInput.value = ''; // Reset the file input
    }
  });
});

function objectExistsByProperties(list, targetObject, propertiesToMatch) {
  return list.some(item => {
    return propertiesToMatch.every(prop => item[prop] === targetObject[prop]);
  });
}

function removeAllObjectsInPlaceByGivenProperties(list, targetObject, propertiesToCompare) {
  let removedCount = 0; // Keep track of how many items were removed

  // Iterate backward to avoid issues with shifting indices when splicing
  for (let i = list.length - 1; i >= 0; i--) {
    const item = list[i];
    // Check if ALL properties in `propertiesToCompare` match between `item` and `targetObject`
    const allPropsMatch = propertiesToCompare.every(prop =>
      item[prop] === targetObject[prop]
    );

    if (allPropsMatch) {
      list.splice(i, 1); // Remove 1 element at the current index
      removedCount++;
    }
  }
  return removedCount;
}

function getUniquePropertyValues(list, propertyName) {
  return Array.from(new Set(list.map(item => item[propertyName])));
}

function getUniqueName(name, existing_aliases, file_aliases) {
  const unique_existing_names = getUniquePropertyValues(existing_aliases, 'name');
  let i = 0;
  let newName = name;
  while (true) {
    if (unique_existing_names.includes(newName)) {
      newName = name + ++i;
    } else {
      break;
    }
  }
  return newName;
}

async function mergeFileAliasesIntoExistingAliases(file_aliases) {
  const existing_aliases = await alias_controller.get_aliases();
  const new_aliases = [];
  for (const existing_alias of existing_aliases) {
    removeAllObjectsInPlaceByGivenProperties(
      file_aliases, existing_alias, [ 'name', 'url' ]);
  }

  // Add to existing from file aliases.
  for (let file_alias of file_aliases) {
    let uniqueName = getUniqueName(
      file_alias.name, existing_aliases, file_aliases);
    new_aliases.push(new Alias(-1, uniqueName, file_alias.url));
  }
  return new_aliases;
}

async function merge_or_replace_aliases(file_aliases, merge) {
  let new_aliases;
  if (merge) {
    new_aliases = await mergeFileAliasesIntoExistingAliases(file_aliases);
  } else {
    await alias_controller.delete_all_aliases();
    new_aliases = file_aliases;
  }
  for (let values of new_aliases) {
    await alias_controller.create_alias(values);
  }
}
