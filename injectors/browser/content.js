if (document.readyState === "loading") {
  chrome.runtime.sendMessage("meow").then((changed) => changed && location.reload());
}
