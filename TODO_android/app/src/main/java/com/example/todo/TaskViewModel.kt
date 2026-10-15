package com.example.todo

import android.app.Application
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.AndroidViewModel

/**
 * Holds the list of tasks for the UI and saves every change to storage.
 *
 * `tasks` is Compose state: every composable that reads it redraws
 * automatically when it changes. A ViewModel also survives configuration
 * changes, such as rotating the screen, so the list isn't reloaded each time.
 *
 * iOS counterpart: TaskViewModel.swift
 */
class TaskViewModel(application: Application) : AndroidViewModel(application) {

    private val storage = TaskStorage(application)

    var tasks by mutableStateOf(storage.load())
        private set

    fun addTask(name: String, description: String) {
        tasks = tasks + TodoTask(name = name, description = description)
        storage.save(tasks)
    }

    fun updateTask(task: TodoTask, name: String, description: String) {
        tasks = tasks.map {
            if (it.id == task.id) it.copy(name = name, description = description) else it
        }
        storage.save(tasks)
    }

    fun deleteTask(task: TodoTask) {
        tasks = tasks.filter { it.id != task.id }
        storage.save(tasks)
    }
}
