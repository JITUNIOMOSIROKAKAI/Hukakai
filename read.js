function autosave(isauto) {
    const transaction = db.transaction(["sheet"], "readwrite"),
        objectstore = transaction.objectStore("sheet");
    if (saveindex == null) {
        return;
    }
    objectstore.put({"Index": saveindex,"title": data.title,"value":data});
}