document.addEventListener('DOMContentLoaded', () => {
  const saveAliasesToFileButton = document.getElementById('saveAliasesToFile');
  const loadAliasesFromFileInput = document.getElementById('loadAliasesFromFile');

  saveAliasesToFileButton.addEventListener('click', () => {
    chrome.storage.sync.get('aliases', (data) => {
      const aliases = data.aliases || {};
      let text = '';
      for (const alias in aliases) {
        text += `${alias} ${aliases[alias].desc} ${aliases[alias].url.replace(/^https:\/\/|http:\/\//i, '')}\n`;
      }
      const filename = 'url_aliases_export.txt';
      const blob = new Blob([text], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      chrome.downloads.download({
        url: url,
        filename: filename,
      });
      URL.revokeObjectURL(url);
    });
  });

  loadAliasesFromFileInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target.result;
        const lines = text.split('\n').filter(line => line.trim() !== '');
        const newAliases = {};
        for (const line of lines) {
          const parts = line.split(' ');
          if (parts.length >= 2) {
            const alias = parts[0];
            const url = parts[parts.length - 1];
            const descParts = parts.slice(1, parts.length - 1);
            const desc = descParts.join(' ');
            if (alias && url) {
              newAliases[alias] = {
                desc: desc,
                url: url.startsWith('http') ? url : 'https://' + url,
              };
            }
          }
        }
        chrome.storage.sync.set({ aliases: newAliases }, () => {
          chrome.runtime.sendMessage({ action: 'reloadPopup' }); // Request popup reload
        });
      };
      reader.readAsText(file);
      loadAliasesFromFileInput.value = ''; // Reset the file input
    }
  });
});
