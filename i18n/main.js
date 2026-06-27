let i18n
const userLang = navigator.language || navigator.userLanguage 
let langCode = userLang.substring(0, 2)

export async function loadTranslation() {
    if (!localStorage.getItem("lang")) localStorage.setItem("lang", langCode)
    else langCode = localStorage.getItem("lang")
    try {
        let res = await fetch(`./i18n/${langCode}.json`)
        if (res.ok) i18n = await res.json()
        else {
            let res = await fetch(`./i18n/en.json`)
            if (res.ok) i18n = await res.json()
        }
    } catch {
        let res = await fetch(`./i18n/en.json`)
        if (res.ok) {
            i18n = await res.json()
            localStorage.setItem("lang", "en")
        }
    }
}

export function getTranslation(key) {
    return i18n[key] || "Undefined"
}

export function applyTranslation() {
    $("[data-i18n]").each(function () {
        const attr = $(this).attr("data-i18n-attr")
        const key = $(this).attr("data-i18n")
        if (attr) $(this).attr(attr, i18n[key] || "Undefined")
        else $(this).text(i18n[key] || "Undefined")
    })
}