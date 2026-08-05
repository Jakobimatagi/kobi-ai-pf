import { useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  TextField,
} from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import type { Priority, Task } from './types';
import { ticketKey } from './types';
import type { TaskPatch } from './api';

interface Props {
  task: Task;
  onSave: (id: string, patch: TaskPatch) => void;
  onDelete: (task: Task) => void;
  onClose: () => void;
}

export default function IssueModal({ task, onSave, onDelete, onClose }: Props) {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);
  const [priority, setPriority] = useState<Priority>(task.priority);

  const save = () => {
    const patch: TaskPatch = {};
    if (title.trim() && title !== task.title) patch.title = title.trim();
    if (description !== task.description) patch.description = description;
    if (priority !== task.priority) patch.priority = priority;
    if (Object.keys(patch).length > 0) onSave(task.id, patch);
    onClose();
  };

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle className="flex items-center gap-2">
        <span className="font-mono text-sm font-semibold text-slate-400">{ticketKey(task)}</span>
        <span className="text-slate-800">Edit issue</span>
      </DialogTitle>
      <DialogContent className="flex flex-col gap-4 pt-2">
        <TextField
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          fullWidth
          autoFocus
          margin="dense"
        />
        <TextField
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          fullWidth
          multiline
          minRows={3}
        />
        <TextField
          select
          label="Priority"
          value={priority}
          onChange={(e) => setPriority(e.target.value as Priority)}
          fullWidth
        >
          <MenuItem value="LOW">Low</MenuItem>
          <MenuItem value="MED">Medium</MenuItem>
          <MenuItem value="HIGH">High</MenuItem>
        </TextField>
      </DialogContent>
      <DialogActions className="justify-between px-6 pb-4">
        <Button
          color="error"
          startIcon={<DeleteOutlineIcon />}
          onClick={() => onDelete(task)}
        >
          Delete
        </Button>
        <div>
          <Button onClick={onClose} color="inherit">
            Cancel
          </Button>
          <Button onClick={save} variant="contained">
            Save
          </Button>
        </div>
      </DialogActions>
    </Dialog>
  );
}
