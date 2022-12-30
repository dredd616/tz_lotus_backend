import path from 'path';
import url from 'url';

const resolve = (importMetaUrl, ...paths) =>
    path.resolve(path.dirname(url.fileURLToPath(importMetaUrl)), ...paths);

export { resolve };
