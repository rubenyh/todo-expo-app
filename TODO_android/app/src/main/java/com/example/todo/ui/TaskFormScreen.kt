package com.example.todo.ui

import androidx.activity.compose.BackHandler
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import com.example.todo.R
import com.example.todo.TodoTask
import com.example.todo.ui.theme.TodoTheme

/**
 * A full-screen form for creating a new task or editing an existing one.
 *
 * TaskListScreen shows it in place of the list. The close (X) button and the
 * system Back gesture both close it without saving.
 *
 * iOS counterpart: TaskFormView.swift
 *
 * @param task The task being edited, or `null` when creating a new one.
 * @param onSave Called with the trimmed name and description when the user taps Save.
 * @param onDismiss Called when the form should close.
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun TaskFormScreen(
    task: TodoTask?,
    onSave: (name: String, description: String) -> Unit,
    onDismiss: () -> Unit,
) {
    // Start the text fields with the existing values (or empty for a new task).
    // rememberSaveable keeps what the user typed across screen rotation.
    var name by rememberSaveable { mutableStateOf(task?.name ?: "") }
    var description by rememberSaveable { mutableStateOf(task?.description ?: "") }

    // Make the system Back gesture close the form instead of exiting the app.
    BackHandler(onBack = onDismiss)

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Text(stringResource(if (task == null) R.string.new_task else R.string.edit_task))
                },
                navigationIcon = {
                    IconButton(onClick = onDismiss) {
                        Icon(
                            painter = painterResource(R.drawable.ic_close),
                            contentDescription = stringResource(R.string.cancel),
                        )
                    }
                },
                actions = {
                    TextButton(
                        onClick = {
                            onSave(name.trim(), description.trim())
                            onDismiss()
                        },
                        enabled = name.isNotBlank(),
                    ) {
                        Text(stringResource(R.string.save))
                    }
                },
            )
        },
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .padding(innerPadding)
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp),
        ) {
            OutlinedTextField(
                value = name,
                onValueChange = { name = it },
                label = { Text(stringResource(R.string.name)) },
                singleLine = true,
                modifier = Modifier.fillMaxWidth(),
            )
            OutlinedTextField(
                value = description,
                onValueChange = { description = it },
                label = { Text(stringResource(R.string.description)) },
                minLines = 3,
                modifier = Modifier.fillMaxWidth(),
            )
        }
    }
}

@Preview(showBackground = true)
@Composable
private fun TaskFormScreenPreview() {
    TodoTheme {
        TaskFormScreen(task = null, onSave = { _, _ -> }, onDismiss = {})
    }
}
