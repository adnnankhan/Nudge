/** Open the demo menu from anywhere (Home header long-press, D key). */
export const DEMO_EVENT = 'nudge:demo-menu'
export const openDemoMenu = () => window.dispatchEvent(new Event(DEMO_EVENT))
