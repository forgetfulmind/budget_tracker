

export function checkForIndexedDb() {
  if (!window.indexedDB) {
    console.log("Your browser doesn't support a stable version of IndexedDB.");
    return false;
  }
  return true;
}

export function useIndexedDb(databaseName, storeName, method, object) {
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open(databaseName, 1);
    let db,
       tx,
      store;

    request.onupgradeneeded = function(e) {
      const db = request.result;
      db.createObjectStore(storeName, { keyPath: "_id" });
    };

    request.onerror = function(e) {
      console.log("There was an error");
    };

    request.onsuccess = function(e) {
      db = request.result;
      tx = db.transaction(storeName, "readwrite");
      store = tx.objectStore(storeName);

      db.onerror = function(e) {
        console.log("error");
      };

      if (method === "put") {
        store.put(object);
      } else if (method === "get") {
        const all = store.getAll();
        all.onsuccess = function() {
          resolve(all.result);
        };
      } else if (method === "delete") {
        store.delete(object._id);
      }
      else if (method === "deleteAll") {
        store.clear();
      }
      // tx.oncomplete = function() {
      //   db.close();
      // };
    };
  });
}


//function for saving record offline 
export function saveRecord(squid) {
  console.log(squid)
  let date = squid.date
  let squidObj = { "_id": date, transaction : squid }
  if (checkForIndexedDb()) {
    console.log(squidObj)
    useIndexedDb("budget", "transactionsStore", "put", squidObj)
  }
}

//function for checking database 
export function checkDatabase() {
  useIndexedDb("budget", "transactionsStore", "get").then((result)=>{
    console.log(result)
    let body = []
    for (let i = 0; i < result.length; i++){
      console.log(result[i])
     let obj = {
        name: result[i].transaction.name,
        value: result[i].transaction.value,
        date: result[i].transaction.date
      }
      body.push(obj)
    }

      if (result.length > 0) {
        console.log(body)
        fetch("/api/transaction/bulk", {
          method: "POST",
          body: JSON.stringify(body),
          headers: {
            Accept: "application/json, text/plain, */*",
            "Content-Type": "application/json"
          }
        })
          .then(response => response.json())
          .then(() => {
            useIndexedDb("budget", "transactionsStore", "deleteAll")
          });
      }
    
  
  })


}

//app coming back online
window.addEventListener("online", checkDatabase);