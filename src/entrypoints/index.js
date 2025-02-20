function init() {
    import ('@/scripts/main');
}

init();

// function registerInitCKEvents() {
//     const events = ['touchstart', 'mouseover', 'keydown', 'forceJsInit'];
//     if (!events?.length) {
//         return;
//     }

//     events.forEach((eventName) => {
//         document.addEventListener(eventName, () => {
//             init();
//         }, { once: true })
//     });
// }

// registerInitCKEvents();