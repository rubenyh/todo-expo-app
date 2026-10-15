package com.example.todo

import java.util.UUID

/**
 * A single to-do item.
 *
 * A `data class` is immutable here (`val`). To change a task we create a
 * modified copy with `task.copy(name = "...")`.
 *
 * iOS counterpart: TodoTask.swift
 */
data class TodoTask(
    val id: String = UUID.randomUUID().toString(),
    val name: String,
    val description: String,
)
