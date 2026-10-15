package com.example.todo

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.viewModels
import com.example.todo.ui.TaskListScreen
import com.example.todo.ui.theme.TodoTheme

/**
 * App entry point. Android starts this Activity when the user taps the app
 * icon, because AndroidManifest.xml gives it the MAIN/LAUNCHER intent filter.
 *
 * iOS counterpart: TodoApp.swift
 */
class MainActivity : ComponentActivity() {

    // Created on first use and kept alive across screen rotations.
    private val viewModel: TaskViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        // Draw behind the status and navigation bars (the modern Android look).
        enableEdgeToEdge()
        setContent {
            TodoTheme {
                TaskListScreen(viewModel = viewModel)
            }
        }
    }
}
