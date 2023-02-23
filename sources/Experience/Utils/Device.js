// import signal from "philbin-packages/signal";
// import Bowser from "bowser";

// import { store } from "./Device";

// const html = document.documentElement;
// const deviceList = ["desktop", "mobile"];

// export default class Device {
//   constructor() {
//     this.checkDevice();
//     this.checkBrowser();
//     this.setHtmlStyle();

//     document.addEventListener("visibilitychange", this.checkVisibility.bind(this));
//   }

//   checkDevice() {
//     let device = null;
//     if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
//       device = deviceList[1]; // Mobile
//       store.device.isMobile = true;
//     } else {
//       device = deviceList[0]; // Desktop
//       store.device.isMobile = false;
//     }

//     deviceList.forEach((e) => {
//       if (e === device) html.classList.add(e);
//       else html.classList.remove(e);
//     });
//   }

//   checkBrowser() {
//     const bowser = Bowser.parse(navigator.userAgent);

//     const osName = bowser.os.name.toLowerCase();
//     const osVersion = bowser.os.version;
//     const browserName = bowser.browser.name.toLowerCase();
//     const browserVersion = bowser.browser.version;

//     html.classList.add(osName, browserName, browserVersion);
//     store.browser = browserName;
//     store.device.os.name = osName;
//     store.device.os.version = osVersion;
//   }

//   setHtmlStyle() {
//     html.style.setProperty("--vp-height", `${store.resolution.height}px`);
//     html.style.setProperty("--vp-width", `${store.resolution.width}px`);
//   }

//   checkVisibility() {
//     signal.emit("dom:visibility", !document.hidden);
//   }

//   resize() {
//     this.checkDevice();
//     this.setHtmlStyle();
//   }

//   destroy() {
//     store.device.isMobile = null;
//     store.device.os = {};
//     store.browser = null;
//     store.style = null;

//     html.style.removeProperty("--vp-height");
//     html.style.removeProperty("--vp-width");
//     html.removeAttribute("class");

//     document.removeEventListener("visibilitychange", this.checkVisibility.bind(this));
//   }
// }
