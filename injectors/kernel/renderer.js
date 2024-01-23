export default new (class KernelShelter {
  async start() {
    console.log("[kernel-shelter/renderer] Hello, World! Waiting for shelter global...");
    let loopsAllowed = 1000;
    while (!window.KernelShelterNative && loopsAllowed--) {
      await new Promise(setTimeout);
    }

    console.log("[kernel-shelter/renderer] got it! (or timed out...)", window.KernelShelterNative);
    (0, eval)(KernelShelterNative.bundle);

    // we don't need this anymore :)
    delete window.KernelShelterNative;
  }
})();
