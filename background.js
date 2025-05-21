import AliasController from "/src/logic/alias_controller.js"


chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === "install" || details.reason === "update") {
    // If the extension is removed then re-added, the aliases don't work unless there
    // is some interaction first. Hence, reload one alias.
    await AliasController.get_instance().reloadOneAlias();
  }
});
