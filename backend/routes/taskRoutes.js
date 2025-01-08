const express = require('express');
const Task = require('../models/task');
const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const tasks = await Task.find();
        res.status(200).json(tasks);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch tasks' });
    }
});

router.post('/newTask', async (req, res) => {
    const { name, subject, dueDate, priority, subtasks, status} = req.body;

    try {
        const newTask = new Task({ name, subject, dueDate, priority, subtasks, status });
        await newTask.save();
        res.status(201).json(newTask);
    } catch (err) { 
        res.status(400).json({ error: 'Failed to add task'});    
    }
});

router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { status, priority, subtasks } = req.body;

    // Prepare an object with only the fields to be updated
    const updates = {};
    if (status) {
        if (!['not-started', 'in-progress', 'completed'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status value' });
        }
        updates.status = status;
    }
    if (priority) {
        if (!['low', 'medium', 'high'].includes(priority)) {
            return res.status(400).json({ error: 'Invalid priority value' });
        }
        updates.priority = priority;
    }
    if (subtasks) {
        if (!Array.isArray(subtasks)) {
            return res.status(400).json({ error: 'Subtasks should be an array' });
        }
        updates.subtasks = subtasks;
    }

    try {
        // Update only the fields provided
        const updatedTask = await Task.findByIdAndUpdate(id, updates, { new: true });
        if (!updatedTask) {
            return res.status(404).json({ error: 'Task not found' });
        }
        res.status(200).json(updatedTask);
    } catch (err) {
        console.error('Error during PUT /:id:', err);
        res.status(400).json({ error: 'Failed to update task', details: err.message });
    }
});


router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        await Task.findByIdAndDelete(id);
        res.status(200).json({ message: 'Task deleted successfully' });
    } catch (err) {
        res.status(400).json({ error: 'Failed to delete task' });
    }
});

module.exports = router;