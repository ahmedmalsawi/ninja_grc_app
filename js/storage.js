/**
 * IndexedDB layer for Ninja GRC cases.
 */
(function (global) {
  const DB_NAME = 'ninja-grc';
  const STORE_NAME = 'cases';
  const DB_VERSION = 1;

  let db = null;

  function open() {
    return new Promise((resolve, reject) => {
      if (db) {
        resolve(db);
        return;
      }
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onerror = () => reject(req.error);
      req.onsuccess = () => {
        db = req.result;
        resolve(db);
      };
      req.onupgradeneeded = (e) => {
        const database = e.target.result;
        if (!database.objectStoreNames.contains(STORE_NAME)) {
          database.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      };
    });
  }

  function getAll() {
    return open().then(database => {
      return new Promise((resolve, reject) => {
        const tx = database.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => reject(req.error);
      });
    });
  }

  function getById(id) {
    return open().then(database => {
      return new Promise((resolve, reject) => {
        const tx = database.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.get(id);
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => reject(req.error);
      });
    });
  }

  function save(caseObj) {
    return open().then(database => {
      return new Promise((resolve, reject) => {
        const tx = database.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const now = new Date().toISOString();
        if (!caseObj.createdAt) caseObj.createdAt = now;
        caseObj.updatedAt = now;
        if (caseObj.id && typeof caseObj.id === 'string') {
          const match = caseObj.id.match(/^NJ-\d{4}-(\d+)$/);
          if (match) caseObj.seq = parseInt(match[1], 10);
        }
        const req = store.put(caseObj);
        req.onsuccess = () => resolve(caseObj);
        req.onerror = () => reject(req.error);
      });
    });
  }

  function remove(id) {
    return open().then(database => {
      return new Promise((resolve, reject) => {
        const tx = database.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req = store.delete(id);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    });
  }

  function nextSeq() {
    return getAll().then(cases => {
      let max = 0;
      cases.forEach(c => {
        if (c.seq != null && c.seq > max) max = c.seq;
        if (c.id && typeof c.id === 'string') {
          const match = c.id.match(/^NJ-\d{4}-(\d+)$/);
          if (match) {
            const n = parseInt(match[1], 10);
            if (n > max) max = n;
          }
        }
      });
      return max + 1;
    });
  }

  global.NinjaStorage = {
    open,
    getAll,
    getById,
    save,
    remove,
    nextSeq
  };
})(typeof window !== 'undefined' ? window : this);
