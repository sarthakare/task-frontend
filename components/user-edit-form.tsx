"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Loader2,
  Eye,
  EyeOff
} from "lucide-react";
import { api } from "@/lib/api-service";

// Types
interface User {
  id: number;
  name: string;
  email: string;
  mobile?: string;
  role: string;
  department: string;
  supervisor_id?: number;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

interface UserEditFormProps {
  user: User;
  onSubmit: (userData: Partial<User>) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

export function UserEditForm({ user, onSubmit, onCancel, isSubmitting }: UserEditFormProps) {
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    mobile: user.mobile || '',
    department: user.department,
    role: user.role,
    password: '',
    confirmPassword: '',
  });
  
  const [resetPassword, setResetPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [roles, setRoles] = useState<string[]>([]);
  const [isLoadingRoles, setIsLoadingRoles] = useState(false);
  const [departments, setDepartments] = useState<string[]>([]);
  const [isLoadingDepartments, setIsLoadingDepartments] = useState(false);

  const fetchDepartments = async () => {
    setIsLoadingDepartments(true);
    try {
      const data = await api.users.getDepartments();
      setDepartments(data);
    } catch (error) {
      console.error('Error fetching departments:', error);
    } finally {
      setIsLoadingDepartments(false);
    }
  };

  const fetchRoles = async () => {
    setIsLoadingRoles(true);
    try {
      const data = await api.users.getRoles();
      setRoles(data);
    } catch (error) {
      console.error('Error fetching roles:', error);
    } finally {
      setIsLoadingRoles(false);
    }
  };

  useEffect(() => {
    fetchRoles();
    fetchDepartments();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate password if reset is enabled
    if (resetPassword) {
      if (!formData.password) {
        alert('Please enter a new password');
        return;
      }
      if (formData.password.length < 8) {
        alert('Password must be at least 8 characters long');
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        alert('Passwords do not match');
        return;
      }
    }
    
    // Prepare data for submission
    const submitData = {
      name: formData.name,
      email: formData.email,
      mobile: formData.mobile,
      department: formData.department,
      role: formData.role,
      ...(resetPassword && { password: formData.password })
    };
    
    onSubmit(submitData);
  };  

  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="edit-name">Full Name</Label>
          <Input
            id="edit-name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Enter full name"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit-email">Email</Label>
          <Input
            id="edit-email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            placeholder="Enter email address"
            required
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="edit-mobile">Mobile Number</Label>
          <Input
            id="edit-mobile"
            type="tel"
            value={formData.mobile}
            onChange={(e) => setFormData(prev => ({ ...prev, mobile: e.target.value }))}
            placeholder="Enter mobile number"
          />
        </div>
        {user.role.toUpperCase() !== 'CEO' && (
          <div className="space-y-2">
            <Label htmlFor="edit-department">Department</Label>
            {isLoadingDepartments ? (
              <div className="flex items-center gap-2 p-2 border rounded-md bg-gray-50">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-muted-foreground">Loading departments...</span>
              </div>
            ) : (
              <Select value={formData.department} onValueChange={(value) => setFormData(prev => ({ ...prev, department: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept: string) => (
                    <SelectItem key={dept} value={dept}>
                      {dept.charAt(0).toUpperCase() + dept.slice(1).replace('_', ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        )}
      </div>

      {user.role.toUpperCase() !== 'CEO' && (
        <div className="space-y-2">
          <Label htmlFor="edit-role">Role</Label>
          {isLoadingRoles ? (
            <div className="flex items-center gap-2 p-2 border rounded-md bg-gray-50">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm text-muted-foreground">Loading roles...</span>
            </div>
          ) : (
            <Select value={formData.role} onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role: string) => (
                  <SelectItem key={role} value={role}>
                    {role.charAt(0).toUpperCase() + role.slice(1).replace('_', ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          
          {/* Role change warning */}
          {formData.role !== user.role && (
            <div className="bg-blue-50 p-3 rounded-md border border-blue-200">
              <p className="text-sm text-blue-800">
                <strong>Role Change Warning:</strong> Changing a user&apos;s role will affect their permissions and access levels.
              </p>
              <p className="text-sm text-blue-600 mt-1">
                <strong>Current Role:</strong> {user.role.charAt(0).toUpperCase() + user.role.slice(1).replace('_', ' ')}
              </p>
            </div>
          )}
        </div>
      )}

      {user.role.toUpperCase() === 'CEO' && (
        <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 p-4 rounded-md">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">CEO</span>
            </div>
            <div>
              <p className="text-sm font-medium text-green-900">Chief Executive Officer</p>
              <p className="text-xs text-green-700">All Departments • Full System Access</p>
            </div>
          </div>
        </div>
      )}

      {/* Password Reset Section */}
      <div className="space-y-4 border-t pt-4">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="reset-password"
            checked={resetPassword}
            onChange={(e) => {
              setResetPassword(e.target.checked);
              if (!e.target.checked) {
                setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
              }
            }}
            className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
          />
          <Label htmlFor="reset-password" className="text-sm font-medium text-gray-700">
            Reset Password
          </Label>
        </div>

        {resetPassword && (
          <div className="space-y-4 bg-gray-50 p-4 rounded-md">
            <div className="space-y-2">
              <Label htmlFor="edit-password" className="text-sm font-medium text-gray-700">New Password</Label>
              <div className="relative">
                <Input
                  id="edit-password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Enter new password"
                  className="pr-10"
                  required={resetPassword}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-confirm-password" className="text-sm font-medium text-gray-700">Confirm New Password</Label>
              <div className="relative">
                <Input
                  id="edit-confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  placeholder="Confirm new password"
                  className="pr-10"
                  required={resetPassword}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {formData.password && formData.confirmPassword && (
              <div className={`text-sm ${formData.password === formData.confirmPassword ? 'text-green-600' : 'text-red-600'}`}>
                {formData.password === formData.confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
              </div>
            )}

            <div className="bg-yellow-50 p-3 rounded-md border border-yellow-200">
              <p className="text-sm text-yellow-800">
                <strong>Warning:</strong> Changing the password will require the user to log in with the new password.
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Updating...' : 'Update User'}
        </Button>
      </div>
    </form>
  );
}
