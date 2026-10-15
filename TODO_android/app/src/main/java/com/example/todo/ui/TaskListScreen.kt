package com.example.todo.ui

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.ListItem
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import com.example.todo.R
import com.example.todo.TaskViewModel
import com.example.todo.TodoTask
import com.example.todo.ui.theme.TodoTheme

/**
 * The main screen: lists every task and lets the user add, edit, and delete them.
 *
 * iOS counterpart: TaskListView.swift
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun TaskListScreen(viewModel: TaskViewModel) {
    // Which form is open. Setting these shows the form; rememberSaveable
    // keeps them across screen rotation.
    var isAddingTask by rememberSaveable { mutableStateOf(false) }
    var taskToEditId by rememberSaveable { mutableStateOf<String?>(null) }
    val taskToEdit = viewModel.tasks.find { it.id == taskToEditId }

    // Created here, outside the `when` below, so the list keeps its scroll
    // position while the form is open.
    val listState = rememberLazyListState()

    // Compose has no built-in navigation, so the form is shown in place of
    // the list while one of the state variables above says it's open.
    when {
        isAddingTask -> TaskFormScreen(
            task = null,
            onSave = { name, description -> viewModel.addTask(name, description) },
            onDismiss = { isAddingTask = false },
        )

        taskToEdit != null -> TaskFormScreen(
            task = taskToEdit,
            onSave = { name, description -> viewModel.updateTask(taskToEdit, name, description) },
            onDismiss = { taskToEditId = null },
        )

        else -> Scaffold(
            topBar = {
                TopAppBar(title = { Text(stringResource(R.string.tasks)) })
            },
            // The floating action button is Android's standard spot for a screen's main action.
            floatingActionButton = {
                FloatingActionButton(onClick = { isAddingTask = true }) {
                    Icon(
                        painter = painterResource(R.drawable.ic_add),
                        contentDescription = stringResource(R.string.add_task),
                    )
                }
            },
        ) { innerPadding ->
            if (viewModel.tasks.isEmpty()) {
                EmptyState(modifier = Modifier.padding(innerPadding))
            } else {
                LazyColumn(
                    modifier = Modifier.padding(innerPadding),
                    state = listState,
                    // Extra space at the bottom so the last row can scroll above the button.
                    contentPadding = PaddingValues(bottom = 88.dp),
                ) {
                    items(viewModel.tasks, key = { it.id }) { task ->
                        TaskRow(
                            task = task,
                            onClick = { taskToEditId = task.id },
                            onDelete = { viewModel.deleteTask(task) },
                        )
                    }
                }
            }
        }
    }
}

/** One row in the list: the task name, with the description below it. */
@Composable
private fun TaskRow(task: TodoTask, onClick: () -> Unit, onDelete: () -> Unit) {
    ListItem(
        headlineContent = { Text(task.name) },
        supportingContent = if (task.description.isNotEmpty()) {
            { Text(task.description, maxLines = 2, overflow = TextOverflow.Ellipsis) }
        } else {
            null
        },
        trailingContent = {
            IconButton(onClick = onDelete) {
                Icon(
                    painter = painterResource(R.drawable.ic_delete),
                    contentDescription = stringResource(R.string.delete_task),
                )
            }
        },
        modifier = Modifier.clickable(onClick = onClick),
    )
}

/** Shown instead of the list when there are no tasks yet. */
@Composable
private fun EmptyState(modifier: Modifier = Modifier) {
    Column(
        modifier = modifier.fillMaxSize(),
        verticalArrangement = Arrangement.spacedBy(8.dp, Alignment.CenterVertically),
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        Icon(
            painter = painterResource(R.drawable.ic_checklist),
            contentDescription = null,
            modifier = Modifier.size(48.dp),
            tint = MaterialTheme.colorScheme.onSurfaceVariant,
        )
        Text(stringResource(R.string.no_tasks), style = MaterialTheme.typography.titleLarge)
        Text(
            stringResource(R.string.no_tasks_hint),
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
        )
    }
}

@Preview(showBackground = true)
@Composable
private fun TaskRowPreview() {
    TodoTheme {
        TaskRow(
            task = TodoTask(name = "Buy groceries", description = "Milk, eggs, and bread"),
            onClick = {},
            onDelete = {},
        )
    }
}
