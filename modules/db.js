import {openDB} from '../libs/idb.js'

const DBPromise = openDB("NotesDB", 1, {
    upgrade(db) {
        db.createObjectStore("notes")
        db.createObjectStore("files", {keyPath: "id"})
        db.createObjectStore("countsForChart")
    }
})

const db = await DBPromise

let counts = [0, 0, 0, 0]
const dbCounts = await db.get("countsForChart", "counts")

if (dbCounts) counts = dbCounts

export async function getNotes() {
    const notesKeys = await db.getAllKeys("notes")
    const notes = await db.getAll("notes")

    const files = await db.getAll("files")

    let notesObj = {}

    notesKeys.forEach((key, i) => notesObj[key] = notes[i]);

    return [notesObj, files]
}

export async function putNote(note, id) {
    if (!note) return
    if (!await db.get("notes", id)) {
        counts[0]++
        await db.put("countsForChart", counts, "counts")
    }
    await db.put("notes", note, id)
}

export async function putFile(file) {
    if (!file) return
    await db.put("files", file)
    counts[2]++
    await db.put("countsForChart", counts, "counts")
}

export async function deleteNote(noteId) {
    if (!await db.get("notes", noteId)) return
    await db.delete("notes", noteId)
    counts[1]++
    await db.put("countsForChart", counts, "counts")
}

export async function deleteFile(fileId) {
    if (!await db.get("files", fileId)) return
    await db.delete("files", fileId)
    counts[3]++
    await db.put("countsForChart", counts, "counts")
}

export function getCounts() {
    return counts
}