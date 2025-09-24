/**
 * Author: Fighan Suliman
 * Version: 1.0
 * Datum: 24.09.2025
 * 
 * Zentrale API-Funktionen für Notizen, Bilder, Authentifizierung und Sharing
 * Bietet Token-Management, Fehlerbehandlung und Wrapper für Axios/Fetch
 */

import axios from "axios"
import { jwtDecode } from "jwt-decode"

// Basis-URL der API
const API_URL = "http://localhost:8080"

// Axios-Instanz erstellen
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json"
  },
  timeout: 8000
})

// Zentrale Fehlerbehandlung für API-Requests
const handleApiError = (error, defaultMessage) => {
  if (axios.isCancel?.(error)) return "Anfrage abgebrochen"
  if (error?.message === "TOKEN_EXPIRED") return "Dein Token ist abgelaufen"

  if (error?.response) {
    console.error("API-Fehler:", error.response.data)
    return error.response.data?.message || defaultMessage
  } else if (error?.request) {
    console.error("Netzwerkfehler:", error.request)
    return "Netzwerkfehler"
  } else {
    console.error("Fehler:", error?.message)
    return defaultMessage
  }
}

// Prüft ob Token abgelaufen ist
const isTokenExpired = (token) => {
  if (!token) return true
  try {
    const { exp } = jwtDecode(token)
    const now = Math.floor(Date.now() / 1000)
    return exp < now
  } catch {
    return true
  }
}

// Token aus localStorage holen
const getAuthToken = () => localStorage.getItem("token")

// Logout-Funktion
export const logoutUser = () => {
  localStorage.removeItem("token")
}

// Header setzen oder Fehler werfen wenn Token abgelaufen
const ensureAuthHeaderOrThrow = () => {
  const token = getAuthToken()
  if (token && !isTokenExpired(token)) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`
  } else {
    delete api.defaults.headers.common["Authorization"]
    logoutUser()
    throw new Error("TOKEN_EXPIRED")
  }
}

// Wrapper für API-Aufrufe
const makeApiCall = async (method, url, data = null, config = {}) => {
  const isAuthFree =
    url.startsWith("/api/auth/login") ||
    url.startsWith("/api/auth/register") ||
    url.startsWith("/api/auth/verify") ||
    url.startsWith("/api/auth/reset-password")

  if (!isAuthFree) {
    ensureAuthHeaderOrThrow()
  }

  try {
    const response = await api({ method, url, data, ...config })
    return response
  } catch (error) {
    throw new Error(handleApiError(error, `Fehler beim ${method} von ${url}`))
  }
}

// Notizen-Funktionen

export const getNotes = async ({ signal } = {}) => {
  try {
    const res = await makeApiCall("get", "/notes/get", null, { signal })
    if (res.status >= 200 && res.status < 300) return res.data
    throw new Error(`Fehler beim Abrufen der Notizen: ${res.statusText}`)
  } catch (error) {
    throw new Error(handleApiError(error, "Fehler beim Abrufen der Notizen"))
  }
}

export const deleteNote = async (noteId, { signal } = {}) => {
  try {
    const res = await makeApiCall("delete", `/notes/delete/${noteId}`, null, { signal })
    if (res?.data?.message) return { success: true, message: res.data.message }
    return { success: true, message: "Notiz erfolgreich gelöscht" }
  } catch (error) {
    throw new Error(handleApiError(error, "Fehler beim Löschen der Notiz"))
  }
}

export const searchNotes = async (searchTerm, { signal } = {}) => {
  try {
    const res = await makeApiCall("get", `/notes/search/${encodeURIComponent(searchTerm)}`, null, { signal })
    return res.data
  } catch (error) {
    throw new Error(handleApiError(error, `Fehler bei der Suche nach Notizen mit Begriff: ${searchTerm}`))
  }
}

export const getNoteById = async (noteId, { signal } = {}) => {
  try {
    const res = await makeApiCall("get", `/notes/get/${noteId}`, null, { signal })
    return res.data
  } catch (error) {
    throw new Error(handleApiError(error, `Fehler beim Abrufen der Notiz mit ID: ${noteId}`))
  }
}

export const createNote = async (formData, token) => {
  try {
    const res = await api.post("/notes/create", formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data"
      },
      maxBodyLength: Infinity
    })
    return res.data
  } catch (error) {
    console.error("Fehler beim Erstellen der Notiz:", error)
    throw new Error(handleApiError(error, "Fehler beim Erstellen der Notiz"))
  }
}

export const updateNote = async (noteId, { title, content, tags, category, type }, { signal } = {}) => {
  try {
    const body = {
      ...(title !== undefined ? { title } : {}),
      ...(content !== undefined ? { content } : {}),
      ...(tags !== undefined ? { tags } : {}),
      ...(category ? { category } : {}),
      ...(type ? { type } : {})
    }
    const res = await makeApiCall("put", `/notes/edit/${noteId}`, body, {
      signal,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAuthToken()}`
      }
    })
    return res.data
  } catch (error) {
    throw new Error(handleApiError(error, "Fehler beim Aktualisieren der Notiz"))
  }
}

export const getNotesFiltered = async ({ q, category, type, from, to }) => {
  const params = new URLSearchParams()
  if (q && q.trim()) params.set("q", q.trim())
  if (category) params.set("category", category)
  if (type) params.set("type", type)
  if (from) params.set("from", new Date(from).toISOString())
  if (to) params.set("to", new Date(to).toISOString())

  const url = `/notes/filter?${params.toString()}`
  const res = await makeApiCall("get", url)
  return res.data
}

// Bilder-Funktionen

export const fetchImagesForNote = async (noteId, { signal } = {}) => {
  try {
    const res = await makeApiCall("get", `/image/note/${noteId}`, null, { signal })
    return res.data
  } catch (error) {
    throw new Error(handleApiError(error, "Fehler beim Abrufen der Bilder"))
  }
}

export const deleteImage = async (imageId) => {
  try {
    const res = await fetch(`${API_URL}/image/delete/${imageId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${getAuthToken()}` }
    })
    if (!res.ok) throw new Error("Fehler beim Löschen des Bildes")
    return await res.json()
  } catch (error) {
    console.error("Fehler beim Löschen des Bildes:", error)
    throw error
  }
}

export const handleImageUpload = async (noteId, formData) => {
  const token = getAuthToken()
  try {
    const res = await fetch(`${API_URL}/image/${noteId}/images`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData
    })
    if (!res.ok) {
      const text = await res.text().catch(() => "")
      throw new Error(`Fehler beim Hochladen des Bildes (${res.status}): ${text}`)
    }
    return await res.json()
  } catch (err) {
    console.error("Fehler beim Hochladen des Bildes:", err)
    throw err
  }
}

// Authentifizierungs-Funktionen

export const loginUser = async (userData) => {
  try {
    const res = await makeApiCall("post", "/api/auth/login", userData)
    return res.data
  } catch (error) {
    throw new Error(handleApiError(error, "Fehler bei der Anmeldung"))
  }
}

export const registerUser = async (userData) => {
  try {
    const res = await makeApiCall("post", "/api/auth/register", userData)
    return res.data
  } catch (error) {
    throw new Error(handleApiError(error, "Fehler bei der Registrierung"))
  }
}

export const verifyUser = async (email, nameLength) => {
  try {
    const res = await makeApiCall("post", "/api/auth/verify", { email, nameLength })
    return res.data
  } catch (error) {
    return handleApiError(error, "Ein Fehler ist aufgetreten")
  }
}

export const resetPassword = async (newPassword) => {
  try {
    const token = localStorage.getItem("resetPassToken")
    const res = await makeApiCall(
      "post",
      "/api/auth/reset-password",
      { newPassword },
      { params: { token }, headers: { "Content-Type": "application/json" } }
    )
    localStorage.removeItem("resetPassToken")
    return res.data
  } catch (error) {
    return (
      error.response?.data || { success: false, error: "Unbekannter Fehler. Bitte später erneut versuchen." }
    )
  }
}

// Share-Funktionen

export const createShareLink = async (noteId) => {
  try {
    const res = await makeApiCall("post", `/api/share/${noteId}`)
    return res.data
  } catch (error) {
    throw new Error(handleApiError(error, "Fehler beim Erstellen des Share-Links"))
  }
}

export const resolveShare = async (token) => {
  try {
    const res = await makeApiCall("get", `/api/share/resolve/${token}`)
    return res.data
  } catch (error) {
    throw new Error(handleApiError(error, "Fehler beim Auflösen des Share-Links"))
  }
}
