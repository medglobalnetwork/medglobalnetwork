// Empty fallback module for packages like pdfjs-dist that try to require('canvas') in Node/browser
const empty = {};
export default empty;
export const createCanvas = () => null;
