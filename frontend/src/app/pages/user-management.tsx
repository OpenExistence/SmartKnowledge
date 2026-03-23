import { useState } from "react";
import { Card } from "../components/card";
import { Button } from "../components/button";
import { Modal } from "../components/modal";
import { Plus, Trash2, Edit, Shield, User } from "lucide-react";

interface UserType {
  id: number;
  name: string;
  email: string;
  role: 'Admin' | 'User';
  lastActive: string;
}

const mockUsers: UserType[] = [
  { id: 1, name: "John Doe", email: "john.doe@company.com", role: "Admin", lastActive: "2026-03-23" },
  { id: 2, name: "Sarah Johnson", email: "sarah.j@company.com", role: "User", lastActive: "2026-03-22" },
  { id: 3, name: "Michael Chen", email: "m.chen@company.com", role: "User", lastActive: "2026-03-23" },
  { id: 4, name: "Emily Rodriguez", email: "emily.r@company.com", role: "User", lastActive: "2026-03-21" },
  { id: 5, name: "David Kim", email: "david.kim@company.com", role: "Admin", lastActive: "2026-03-23" },
  { id: 6, name: "Lisa Wang", email: "lisa.wang@company.com", role: "User", lastActive: "2026-03-20" },
];

export function UserManagement() {
  const [users, setUsers] = useState<UserType[]>(mockUsers);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "User" as 'Admin' | 'User',
  });

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      setUsers(users.filter(u => u.id !== id));
    }
  };

  const handleEdit = (user: UserType) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
    });
    setIsEditModalOpen(true);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const newUser: UserType = {
      id: Math.max(...users.map(u => u.id)) + 1,
      ...formData,
      lastActive: new Date().toISOString().split('T')[0],
    };
    setUsers([...users, newUser]);
    setIsCreateModalOpen(false);
    setFormData({ name: "", email: "", role: "User" });
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedUser) {
      setUsers(users.map(u => 
        u.id === selectedUser.id 
          ? { ...u, ...formData }
          : u
      ));
      setIsEditModalOpen(false);
      setSelectedUser(null);
      setFormData({ name: "", email: "", role: "User" });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold mb-2">User Management</h1>
          <p className="text-muted-foreground">Manage users and their access permissions</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="w-5 h-5" />
          Create User
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-primary/10 text-primary">
              <User className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Users</p>
              <p className="text-2xl font-semibold">{users.length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-secondary/10 text-secondary">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Administrators</p>
              <p className="text-2xl font-semibold">{users.filter(u => u.role === 'Admin').length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-accent/10 text-accent">
              <User className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Regular Users</p>
              <p className="text-2xl font-semibold">{users.filter(u => u.role === 'User').length}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Users Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-border">
              <tr className="text-left">
                <th className="p-4 font-medium text-muted-foreground">Name</th>
                <th className="p-4 font-medium text-muted-foreground">Email</th>
                <th className="p-4 font-medium text-muted-foreground">Role</th>
                <th className="p-4 font-medium text-muted-foreground">Last Active</th>
                <th className="p-4 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-border hover:bg-accent/50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-sm font-medium">
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span className="font-medium">{user.name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-muted-foreground">{user.email}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.role === 'Admin'
                        ? 'bg-primary/10 text-primary'
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {user.role === 'Admin' && <Shield className="w-3 h-3" />}
                      {user.role}
                    </span>
                  </td>
                  <td className="p-4 text-muted-foreground">{user.lastActive}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleEdit(user)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDelete(user.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Create User Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setFormData({ name: "", email: "", role: "User" });
        }}
        title="Create New User"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm mb-2">Full Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., John Doe"
              className="w-full px-4 py-2 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
              required
            />
          </div>
          <div>
            <label className="block text-sm mb-2">Email Address</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="john.doe@company.com"
              className="w-full px-4 py-2 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
              required
            />
          </div>
          <div>
            <label className="block text-sm mb-2">Role</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as 'Admin' | 'User' })}
              className="w-full px-4 py-2 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="User">User</option>
              <option value="Admin">Admin</option>
            </select>
          </div>
          <div className="flex gap-3 pt-4">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={() => {
                setIsCreateModalOpen(false);
                setFormData({ name: "", email: "", role: "User" });
              }} 
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              Create User
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit User Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedUser(null);
          setFormData({ name: "", email: "", role: "User" });
        }}
        title="Edit User"
      >
        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="block text-sm mb-2">Full Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
              required
            />
          </div>
          <div>
            <label className="block text-sm mb-2">Email Address</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
              required
            />
          </div>
          <div>
            <label className="block text-sm mb-2">Role</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as 'Admin' | 'User' })}
              className="w-full px-4 py-2 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="User">User</option>
              <option value="Admin">Admin</option>
            </select>
          </div>
          <div className="flex gap-3 pt-4">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={() => {
                setIsEditModalOpen(false);
                setSelectedUser(null);
                setFormData({ name: "", email: "", role: "User" });
              }} 
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
