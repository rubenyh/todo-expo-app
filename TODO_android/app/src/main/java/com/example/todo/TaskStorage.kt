package com.example.todo

import android.content.Context
import android.util.Log
import org.json.JSONArray
import org.json.JSONException
import org.json.JSONObject
import java.io.File
import java.io.IOException

/**
 * Saves and loads tasks as a single JSON file in the app's private storage.
 * No database is needed for a list this small, and `org.json` is built into
 * Android, so no extra library is needed either.
 *
 * The file is `files/tasks.json` inside the app's private data folder. Other
 * apps can't read it, and Android deletes it when the app is uninstalled.
 *
 * iOS counterpart: TaskStorage.swift
 */
class TaskStorage(context: Context) {

    private val file = File(context.filesDir, "tasks.json")

    fun load(): List<TodoTask> {
        // No file yet means the app is running for the first time.
        if (!file.exists()) return emptyList()
        return try {
            val array = JSONArray(file.readText())
            List(array.length()) { index -> array.getJSONObject(index).toTask() }
        } catch (e: JSONException) {
            Log.e(TAG, "Could not read tasks", e)
            emptyList()
        }
    }

    fun save(tasks: List<TodoTask>) {
        try {
            file.writeText(JSONArray(tasks.map { it.toJson() }).toString())
        } catch (e: IOException) {
            Log.e(TAG, "Could not save tasks", e)
        }
    }

    // Kotlin has no built-in equivalent of Swift's Codable, so each field is
    // copied to and from JSON by hand.
    private fun TodoTask.toJson() = JSONObject()
        .put("id", id)
        .put("name", name)
        .put("description", description)

    private fun JSONObject.toTask() = TodoTask(
        id = getString("id"),
        name = getString("name"),
        description = getString("description"),
    )

    private companion object {
        const val TAG = "TaskStorage"
    }
}
