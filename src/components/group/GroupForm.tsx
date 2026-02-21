import { useState } from 'react';
import { Dialog } from '../common/Dialog';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { KDBXGroup, createGroup } from '../../core/model/database';

interface GroupFormProps {
  open: boolean;
  group?: KDBXGroup | null;
  parentUuid: string;
  onSave: (group: KDBXGroup) => void;
  onClose: () => void;
}

export function GroupForm({ open, group, parentUuid, onSave, onClose }: GroupFormProps) {
  const [name, setName] = useState(group?.name || '');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) return;
    
    const newGroup: KDBXGroup = group ? {
      ...group,
      name: name.trim(),
      lastModificationTime: new Date(),
    } : {
      ...createGroup(name.trim()),
    };
    
    onSave(newGroup);
    onClose();
  };
  
  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      title={group ? 'Edit Group' : 'New Group'}
      size="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Group Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Work, Personal, Finance"
          required
          autoFocus
        />
        
        <div className="flex gap-3 pt-2">
          <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" className="flex-1">
            {group ? 'Save' : 'Create'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
