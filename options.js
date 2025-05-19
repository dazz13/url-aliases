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

async function merge_or_replace_aliases(new_aliases, merge) {
  if (!merge) {
    await alias_controller.delete_all_aliases();
  }
  for (let values of new_aliases) {
    await alias_controller.create_alias(values);
  }
}
