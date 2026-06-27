import { getTranslation, loadTranslation, applyTranslation } from './i18n/main.js';
import { getNotes, putNote, putFile, deleteNote, deleteFile } from './modules/db.js';
import { drawChart } from './modules/chart.js'

$(document).ready(async function () {
    navigator.serviceWorker.register('/notes/sw.js')
    let currentNote = "empty"
    let notesQuantity = 0
    let guideStep = 0
    let filesUrls = []
    await loadTranslation()
    applyTranslation()
    $(`.selectLanguageBtn[data-langCode="${localStorage.getItem("lang")}"]`).addClass("selected")
    const guides = [
        {
            content: '',
            title: 'Hey!',
            text: "Let's get you started with notes by xuduk"
        },
        {
            content: '<div class="note-text-guide">Sample note</div>',
            title: 'Create a note',
            text: 'Just start typing to create a note'
        },
        {
            content: '<div class="notes-list-el-guide">Note <div class="guideBorder"><img src="images/trash.png" class="removeNoteGuide" alt=""></div></div>',
            title: 'Delete a note',
            text: 'Tap the trash icon to delete it'
        },
        {
            content: '<div class="notes-list-el-guide line-through">Note <img src="images/trash.png" class="removeNoteGuide" alt=""></div>',
            title: 'Archive a note',
            text: "Double-tap a note to archive it"
        },
        {
            content: `<div class="flex"><div class="guideBorder"><svg class="openChartBtnGuide" width="800px" height="800px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 19L12 11" stroke="#000000" stroke-width="4" stroke-linecap="round" />
          <path d="M7 19L7 15" stroke="#000000" stroke-width="4" stroke-linecap="round" />
          <path d="M17 19V6" stroke="#000000" stroke-width="4" stroke-linecap="round" />
        </svg></div></div>`,
            title: 'Stats',
            text: "Tap the chart icon to check it out"
        },
        {
            content: '',
            title: 'Privacy?', 
            text: 'All notes are stored locally on your device'
        }
    ]
    $(".note-text").val("")
    let [notes, files] = await getNotes()
    if (notes) {
        for (let note in notes) {
            $(".notes-list").append(`<div class="notes-list-el" title="${note}">${notes[note].title.substring(0, 19)} <img src="images/trash.png" class="removeNote" data-note-id="${note}" alt=""></div>`)
            notesQuantity++
            if (notes[note].isArchived) $(`.notes-list-el[title="${note}"]`).css({
                "text-decoration": "line-through"
            })
        }
        setNotesQuantity()
    }

    if (!localStorage.getItem("firstrun")) {
        showGuide(0)
    }

    function showGuide(step) {
        const guide = guides[step]
        $(".guideModal .title").text(guide.title)
        $(".guideModal .content").html(guide.content)
        $(".guideModal .text").text(guide.text)
        
        $(".guide-modal-overlay, .guideModal").addClass("active")
    }

    $(".next-step").click(function() {
        guideStep++
        if (guideStep >= guides.length) {
            localStorage.setItem("firstrun", true)
            $(".guide-modal-overlay, .guideModal").removeClass("active")
            return
        }
        showGuide(guideStep)
    })

    $(".arrow-left").click(function() {
        $(".note-text").blur()
        $("body").removeClass("view-note")
    })

    $(".selectLanguageBtn").click(async function() {
        const langCode = $(this).attr("data-langCode")
        if (localStorage.getItem("lang") != langCode) {
            localStorage.setItem("lang", langCode)
            $(".selectLanguageBtn").removeClass("selected")
            $(this).addClass("selected")
            await loadTranslation()
            applyTranslation()
            setNotesQuantity()
        }
    })

    $(".notes-list").on("click", ".notes-list-el", function() {
        if(notes[$(this).attr("title")]) {
            currentNote = $(this).attr("title")
            $(".note-text").val(notes[$(this).attr("title")].text)
            $("#createTime").text(notes[$(this).attr("title")].createTime)
            $("body").addClass("view-note")
            $(".note-text").focus()
            $(".open-attachment-modal-btn").css('display', 'flex')
        }
    })

    let isRemovingNote

    $(".notes-list").on("click", ".removeNote", async function(e) {
        e.stopPropagation()
        if (isRemovingNote) return
        isRemovingNote = true
        let noteId = $(this).attr("data-note-id")
        $(`.notes-list-el[title="${noteId}"]`).fadeOut("slow")
        setTimeout(() => $(`.notes-list-el[title="${noteId}"]`).remove(), 800)
        delete notes[noteId]
        if (currentNote == noteId) {
            $(".note-text").val("")
            currentNote = "empty"
            $(".open-attachment-modal-btn").css('display', 'none')
        }
        notesQuantity--
        setNotesQuantity()
        $("#createTime").text("")
        const noteFiles = files.filter(file => file.noteId == noteId)
        noteFiles.forEach(async (file) => await deleteFile(file.id))
        files = files.filter(file => file.noteId != noteId)
        await deleteNote(Number(noteId))
        setTimeout(() => isRemovingNote = false, 800)
    })

    $(".filesModal").on("click", ".deleteFile", async function() {
        const el = $(this).parent().parent()
        await deleteFile(Number(el.attr("data-fileId")))
        el.fadeOut("slow", function() {
            el.remove()
        })
    })

    $(".openSettingsBtn").click(function() {
        $(".settings-modal-overlay, .settingsModal").addClass("active")
    })

    $(".settingsModal").on("click", ".closeIcon", function() {
        $(".settings-modal-overlay, .settingsModal").removeClass("active")
    })

    $(".openChartBtn").click(async function() {
        $(".chart-modal-overlay, .chartModal").addClass("active")
        drawChart()
    })

    $(".chartModal").on("click", ".closeIcon", function() {
        $(".chart-modal-overlay, .chartModal").removeClass("active")
    })

    $(".filesModal").on("click", "img", async function() {
        const fileUrl = $(this).parent().attr("data-fileUrl")
        const fileId = $(this).parent().attr("data-fileId")
        const fileEl = files.find(file => file.id == fileId)
        if (!fileEl) return
        if (fileEl.type.startsWith("image")) {
            $(".fileViewWrapper").html(`<img src="${fileUrl}" class="imgView" alt=""> <svg class="closeIcon" width="800px" height="800px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M8.00386 9.41816C7.61333 9.02763 7.61334 8.39447 8.00386 8.00395C8.39438 7.61342 9.02755 7.61342 9.41807 8.00395L12.0057 10.5916L14.5907 8.00657C14.9813 7.61605 15.6144 7.61605 16.0049 8.00657C16.3955 8.3971 16.3955 9.03026 16.0049 9.42079L13.4199 12.0058L16.0039 14.5897C16.3944 14.9803 16.3944 15.6134 16.0039 16.0039C15.6133 16.3945 14.9802 16.3945 14.5896 16.0039L12.0057 13.42L9.42097 16.0048C9.03045 16.3953 8.39728 16.3953 8.00676 16.0048C7.61624 15.6142 7.61624 14.9811 8.00676 14.5905L10.5915 12.0058L8.00386 9.41816Z"
            fill="#0F0F0F" />
          <path fill-rule="evenodd" clip-rule="evenodd"
            d="M23 12C23 18.0751 18.0751 23 12 23C5.92487 23 1 18.0751 1 12C1 5.92487 5.92487 1 12 1C18.0751 1 23 5.92487 23 12ZM3.00683 12C3.00683 16.9668 7.03321 20.9932 12 20.9932C16.9668 20.9932 20.9932 16.9668 20.9932 12C20.9932 7.03321 16.9668 3.00683 12 3.00683C7.03321 3.00683 3.00683 7.03321 3.00683 12Z"
            fill="#0F0F0F" />
        </svg>`)
        } else {
            $(".fileViewWrapper").html(`<iframe src="${fileUrl}" frameborder="0" class="fileViewFrame"></iframe> <svg class="closeIcon" width="800px" height="800px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M8.00386 9.41816C7.61333 9.02763 7.61334 8.39447 8.00386 8.00395C8.39438 7.61342 9.02755 7.61342 9.41807 8.00395L12.0057 10.5916L14.5907 8.00657C14.9813 7.61605 15.6144 7.61605 16.0049 8.00657C16.3955 8.3971 16.3955 9.03026 16.0049 9.42079L13.4199 12.0058L16.0039 14.5897C16.3944 14.9803 16.3944 15.6134 16.0039 16.0039C15.6133 16.3945 14.9802 16.3945 14.5896 16.0039L12.0057 13.42L9.42097 16.0048C9.03045 16.3953 8.39728 16.3953 8.00676 16.0048C7.61624 15.6142 7.61624 14.9811 8.00676 14.5905L10.5915 12.0058L8.00386 9.41816Z"
            fill="#0F0F0F" />
          <path fill-rule="evenodd" clip-rule="evenodd"
            d="M23 12C23 18.0751 18.0751 23 12 23C5.92487 23 1 18.0751 1 12C1 5.92487 5.92487 1 12 1C18.0751 1 23 5.92487 23 12ZM3.00683 12C3.00683 16.9668 7.03321 20.9932 12 20.9932C16.9668 20.9932 20.9932 16.9668 20.9932 12C20.9932 7.03321 16.9668 3.00683 12 3.00683C7.03321 3.00683 3.00683 7.03321 3.00683 12Z"
            fill="#0F0F0F" />
        </svg>`)
        }
        $(".fileViewWrapper").addClass("active")
        $(".filesModal").removeClass("active")
    })

    $(".fileViewWrapper").on("click", ".closeIcon", function() {
        $(".fileViewWrapper").removeClass("active")
        $(".filesModal").addClass("active")
    })

    $(".notes-list").on("dblclick", ".notes-list-el", async function(e) {
        if ($(e.target).hasClass("removeNote")) return
        const noteId = Number($(this).attr("title"))
        if(notes[noteId]) {
            notes[noteId].isArchived = !notes[noteId].isArchived
            $(this).css({
                "text-decoration": `${notes[noteId].isArchived ? "line-through" : "none"}`
            })
        }
       await putNote(notes[noteId], noteId)
    })

    $(".add-note").click(async function() {
        $(".note-text").val("")
        currentNote = "empty"
        $("body").addClass("view-note")
    })

    $(".open-attachment-modal-btn").click(function() {
        $(".filesModal").html(`<svg class="closeIcon" width="800px" height="800px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M8.00386 9.41816C7.61333 9.02763 7.61334 8.39447 8.00386 8.00395C8.39438 7.61342 9.02755 7.61342 9.41807 8.00395L12.0057 10.5916L14.5907 8.00657C14.9813 7.61605 15.6144 7.61605 16.0049 8.00657C16.3955 8.3971 16.3955 9.03026 16.0049 9.42079L13.4199 12.0058L16.0039 14.5897C16.3944 14.9803 16.3944 15.6134 16.0039 16.0039C15.6133 16.3945 14.9802 16.3945 14.5896 16.0039L12.0057 13.42L9.42097 16.0048C9.03045 16.3953 8.39728 16.3953 8.00676 16.0048C7.61624 15.6142 7.61624 14.9811 8.00676 14.5905L10.5915 12.0058L8.00386 9.41816Z"
            fill="#0F0F0F" />
          <path fill-rule="evenodd" clip-rule="evenodd"
            d="M23 12C23 18.0751 18.0751 23 12 23C5.92487 23 1 18.0751 1 12C1 5.92487 5.92487 1 12 1C18.0751 1 23 5.92487 23 12ZM3.00683 12C3.00683 16.9668 7.03321 20.9932 12 20.9932C16.9668 20.9932 20.9932 16.9668 20.9932 12C20.9932 7.03321 16.9668 3.00683 12 3.00683C7.03321 3.00683 3.00683 7.03321 3.00683 12Z"
            fill="#0F0F0F" />
        </svg> <label for="fileUpload" class="file-upload-label">+</label>`)
        const noteFiles = files.filter(file => file.noteId == currentNote)
        filesUrls = []
        noteFiles.forEach((file) => {
            let imgSrc
            const fileUrl = URL.createObjectURL(file.file)
            filesUrls.push(fileUrl)
            const fileNames = [
                ["image/", fileUrl],                          
                ["audio/", "images/files_icons/sound@2x.png"],
                ["video/", "images/files_icons/video@2x.png"],
                ["text/html", "images/files_icons/html@2x.png"],
                ["text/css", "images/files_icons/css@2x.png"],
                ["application/x-javascript", "images/files_icons/js@2x.png"],
                ["text/javascript", "images/files_icons/js@2x.png"],
                ["application/pdf", "images/files_icons/pdf@2x.png"],
                ["application/zip", "images/files_icons/zip@2x.png"],
                ["application/java", "images/files_icons/java@2x.png"],
                ["application/rtf", "images/files_icons/rtf@2x.png"],
                ["application/x-tar", "images/files_icons/tar@2x.png"],
                ["application/x-sql", "images/files_icons/sqlite3@2x.png"],
                ["text/", "images/files_icons/text@2x.png"],
                ["", "images/files_icons/empty@2x.png"]
            ]
            for (let [type, src] of fileNames) {
                if (file.type.includes(type)) {
                    imgSrc = src;
                    break;
                }
            }
            if (imgSrc === fileUrl) $(".filesModal").prepend(`<div data-fileId="${file.id}" data-fileUrl="${fileUrl}" class="file-wrapper"><img src="${imgSrc}" alt="${file.name}"> <div class="filesBtns"><img src="images/trash.png" class="deleteFile"> <a href="${fileUrl}" download="${file.name}"><img class="down-file-img" src="images/arrow_left.png" alt=""></a></div></div>`)
            else $(".filesModal").prepend(`<div data-fileId="${file.id}" data-fileUrl="${fileUrl}" class="file-wrapper"><p class="file-name">${file.name.length >= 16 ? file.name.substring(0, 16) + "..." : file.name}</p><img src="${imgSrc}" alt="${file.name}"> <div class="filesBtns"><img src="images/trash.png" class="deleteFile"> <a href="${fileUrl}" download="${file.name}"><img class="down-file-img" src="images/arrow_left.png" alt=""></a></div></div>`)
        })
        $(".files-modal-overlay, .filesModal").addClass("active")
    })

    $(".filesModal").on("click", ".closeIcon", function() {
        $(".files-modal-overlay, .filesModal").removeClass("active")
        filesUrls.forEach((file) => URL.revokeObjectURL(file))
    })

    $("#fileUpload").change(async function() {
        const inputFiles = Array.from(this.files)
        if (!inputFiles) return
        if (!Number(currentNote)) return
        inputFiles.forEach(async (file) => { 
            const id = Date.now()
            const fileEl = {
                id,
                noteId: Number(currentNote),
                file,
                name: file.name,
                type: file.type
            }
            let imgSrc
            const fileUrl = URL.createObjectURL(file)
            filesUrls.push(fileUrl)
            const fileNames = [
                ["image/", fileUrl],                          
                ["audio/", "images/files_icons/sound@2x.png"],
                ["video/", "images/files_icons/video@2x.png"],
                ["text/html", "images/files_icons/html@2x.png"],
                ["text/css", "images/files_icons/css@2x.png"],
                ["application/x-javascript", "images/files_icons/js@2x.png"],
                ["text/javascript", "images/files_icons/js@2x.png"],
                ["application/pdf", "images/files_icons/pdf@2x.png"],
                ["application/zip", "images/files_icons/zip@2x.png"],
                ["application/java", "images/files_icons/java@2x.png"],
                ["application/rtf", "images/files_icons/rtf@2x.png"],
                ["application/x-tar", "images/files_icons/tar@2x.png"],
                ["application/x-sql", "images/files_icons/sqlite3@2x.png"],
                ["text/", "images/files_icons/text@2x.png"],
                ["", "images/files_icons/empty@2x.png"]
            ]
            for (let [type, src] of fileNames) {
                if (file.type.includes(type)) {
                    imgSrc = src;
                    break;
                }
            }
            if (imgSrc === fileUrl) $(".filesModal").prepend(`<div data-fileId="${id}" data-fileUrl="${fileUrl}" class="file-wrapper"><img src="${imgSrc}" alt="${file.name}"> <div class="filesBtns"><img src="images/trash.png" class="deleteFile"> <a href="${fileUrl}" download="${file.name}"><img class="down-file-img" src="images/arrow_left.png" alt=""></a></div></div>`)
            else $(".filesModal").prepend(`<div data-fileId="${id}" data-fileUrl="${fileUrl}" class="file-wrapper"><p class="file-name">${file.name.length >= 16 ? file.name.substring(0, 16) + "..." : file.name}</p><img src="${imgSrc}" alt="${file.name}"> <div class="filesBtns"><img src="images/trash.png" class="deleteFile"> <a href="${fileUrl}" download="${file.name}"><img class="down-file-img" src="images/arrow_left.png" alt=""></a></div></div>`)
            files.push(fileEl)
            await putFile(fileEl)
        })
    })

    $(".note-text").on("input", async function () {
        const timestamp = Date.now();
        const readableTime = new Date(timestamp).toLocaleString()
        let title = $(".note-text").val().trim().split(" ").slice(0, 3).join(" ")
        let text = $(".note-text").val()
        if (currentNote === "empty") {
            if (!text.trim()) return
            notes[timestamp] = {
                text,
                title,
                isArchived: false,
                createTime: readableTime
            }
            currentNote = timestamp
            $(".notes-list").append(`<div class="notes-list-el" title="${currentNote}">${title.substring(0, 19)} <img src="images/trash.png" class="removeNote" data-note-id="${currentNote}" alt=""></div>`)
            notesQuantity++
            setNotesQuantity()
            $("#createTime").text(notes[currentNote].createTime)
            $(".open-attachment-modal-btn").css('display', 'flex')
        } else {
            notes[currentNote].text = text
            notes[currentNote].title = title
            // let i = 0;
            // while (notes.hasOwnProperty(title)) {
            //     i++
            //     title = `${$(".note-text").val().split(" ").slice(0, 3).join(" ")} (${i})`
            // }

            $(`.notes-list-el[title="${currentNote}"]`).html(`${title.substring(0, 19) || "Empty"} <img src="images/trash.png" class="removeNote" data-note-id="${currentNote}" alt=""></div>`)
            
            if (!text) {
                $(`.notes-list-el[title="${currentNote}"]`).fadeOut("slow", function() {
                    $(this).remove()
                })
                delete notes[currentNote]
                const noteFiles = files.filter(file => file.noteId == currentNote)
                noteFiles.forEach(async (file) => await deleteFile(file.id))
                files = files.filter(file => file.noteId != currentNote)
                await deleteNote(Number(currentNote))
                currentNote = "empty"
                notesQuantity--
                setNotesQuantity()
                $(".open-attachment-modal-btn").css('display', 'none')
                $("#createTime").text("")
                return
            }
        }
        await putNote(notes[currentNote], Number(currentNote))
    })

    $(".search-input").on("input", function () {
        const val = $(".search-input").val().toLowerCase()
        if (!val) {
            $(`.notes-list-el`).show()
            return
        }
        for (let note in notes) {
            if (notes[note].text.toLowerCase().includes(val)) $(`.notes-list-el[title="${note}"]`).show()
            else $(`.notes-list-el[title="${note}"]`).hide()
        }
    })

    function setNotesQuantity() {
        let notesQuantityText
        let noNotes
        if (notesQuantity == 0) {
            notesQuantityText = getTranslation("no_notes")
            noNotes = true
        }
        else if (notesQuantity == 1) notesQuantityText = getTranslation("one_note")
        else if (notesQuantity < 5) notesQuantityText = getTranslation("few_notes")
        else notesQuantityText = getTranslation("many_notes")
        $("#notesQuantity").text(`${!noNotes ? notesQuantity : ""} ${notesQuantityText}`)
    }
});
