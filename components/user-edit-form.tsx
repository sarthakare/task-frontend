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
  EyeOff,
  Edit,
  XCircle,
  CheckCircle2,
  CircleAlert
} from "lucide-react";
import { api } from "@/lib/api-service";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";

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
  trigger?: React.ReactNode;
  onUserUpdated?: () => void;
}

export function UserEditForm({ user, trigger, onUserUpdated }: UserEditFormProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Auto-open dialog when user is provided (for programmatic opening)
  useEffect(() => {
    if (user && !trigger) {
      setIsDialogOpen(true);
    }
  }, [user, trigger]);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
  const [errors, setErrors] = useState<Record<string, string>>({});

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

  // Fetch data when dialog opens
  useEffect(() => {
    if (isDialogOpen) {
      fetchRoles();
      fetchDepartments();
    }
  }, [isDialogOpen]);

  // Reset form when user changes
  useEffect(() => {
    setFormData({
      name: user.name,
      email: user.email,
      mobile: user.mobile || '',
      department: user.department,
      role: user.role,
      password: '',
      confirmPassword: '',
    });
    setErrors({});
    setResetPassword(false);
  }, [user]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.mobile) {
      newErrors.mobile = 'Mobile number is required';
    } else if (!/^\+?[0-9]{10}$/.test(formData.mobile)) {
      newErrors.mobile = 'Please enter a valid mobile number (10 digits)';
    }

    if (!formData.department) {
      newErrors.department = 'Department is required';
    }

    if (!formData.role) {
      newErrors.role = 'Role is required';
    }

    if (resetPassword) {
      if (!formData.password) {
        newErrors.password = 'Password is required';
      } else if (formData.password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters';
      }

      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare data for API
      const userData = {
        name: formData.name,
        email: formData.email,
        mobile: formData.mobile,
        department: formData.department,
        role: formData.role,
        ...(resetPassword && { password: formData.password })
      };

      await api.users.updateUser(user.id, userData);

      // Show success toast
      toast.success('User updated successfully!', {
        description: `${formData.name}'s information has been updated.`,
        icon: <CheckCircle2 className="text-green-600" />,
        style: { color: "green" },
      });

      // Close dialog and call callback to refresh parent component
      setIsDialogOpen(false);
      if (onUserUpdated) {
        onUserUpdated();
      }

    } catch (error) {
      console.error('Error updating user:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update user';
      setErrors({ submit: errorMessage });

      // Show error toast
      toast.error('Failed to update user', {
        description: errorMessage,
        icon: <CircleAlert className="text-red-600" />,
        style: { color: "red" },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: user.name,
      email: user.email,
      mobile: user.mobile || '',
      department: user.department,
      role: user.role,
      password: '',
      confirmPassword: '',
    });
    setErrors({});
    setResetPassword(false);
    setShowPassword(false);
    setShowConfirmPassword(false);
  };


  const handleDialogClose = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open && onUserUpdated) {
      onUserUpdated();
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
      {trigger && (
        <DialogTrigger asChild>
          {trigger}
        </DialogTrigger>
      )}
      <DialogContent className="min-w-[80vw] min-h-[80vh] overflow-hidden">
        <DialogHeader className="pb-6 border-b border-gray-100">
          <DialogTitle className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2 sm:gap-3">
            <div className="p-2 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg">
              <Edit className="h-5 w-5 text-white" />
            </div>
            Edit User: {user.name}
          </DialogTitle>
          <DialogDescription className="text-gray-600 mt-2">
            Update the user&apos;s information, role, and permissions as needed.
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[calc(80vh-120px)] pr-2">
          <form onSubmit={handleSubmit} className="space-y-6 py-4">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-base sm:text-lg font-medium text-gray-900 border-b pb-2 flex items-center gap-2">
                <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full"></div>
                Basic Information
              </h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name" className="text-sm font-medium text-gray-700">Full Name *</Label>
                  <Input
                    id="edit-name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter full name"
                    className={`h-10 bg-white border-gray-200 hover:border-blue-300 transition-colors ${errors.name ? 'border-red-500 focus:border-red-500' : 'focus:border-blue-500'}`}
                  />
                  {errors.name && <p className="text-sm text-red-500 flex items-center gap-1">
                    <XCircle className="h-4 w-4" />
                    {errors.name}
                  </p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-email" className="text-sm font-medium text-gray-700">Email Address *</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="Enter email address"
                    className={`h-10 bg-white border-gray-200 hover:border-blue-300 transition-colors ${errors.email ? 'border-red-500 focus:border-red-500' : 'focus:border-blue-500'}`}
                  />
                  {errors.email && <p className="text-sm text-red-500 flex items-center gap-1">
                    <XCircle className="h-4 w-4" />
                    {errors.email}
                  </p>}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-mobile" className="text-sm font-medium text-gray-700">Mobile Number *</Label>
                  <Input
                    id="edit-mobile"
                    type="tel"
                    value={formData.mobile}
                    onChange={(e) => handleInputChange('mobile', e.target.value)}
                    placeholder="Enter mobile number"
                    className={`h-10 bg-white border-gray-200 hover:border-blue-300 transition-colors ${errors.mobile ? 'border-red-500 focus:border-red-500' : 'focus:border-blue-500'}`}
                  />
                  {errors.mobile && <p className="text-sm text-red-500 flex items-center gap-1">
                    <XCircle className="h-4 w-4" />
                    {errors.mobile}
                  </p>}
                </div>
              </div>
            </div>

            {/* Role & Department */}
            <div className="space-y-4">
              <h3 className="text-base sm:text-lg font-medium text-gray-900 border-b pb-2 flex items-center gap-2">
                <div className="w-1 h-6 bg-gradient-to-b from-purple-500 to-pink-600 rounded-full"></div>
                Role & Department
              </h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {user.role.toUpperCase() !== 'CEO' && (
                  <div className="space-y-2">
                    <Label htmlFor="edit-role" className="text-sm font-medium text-gray-700">Role/Designation *</Label>
                    {isLoadingRoles ? (
                      <div className="flex items-center gap-2 p-2 border rounded-md bg-gray-50 h-10">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm text-muted-foreground">Loading roles...</span>
                      </div>
                    ) : (
                      <Select value={formData.role} onValueChange={(value) => handleInputChange('role', value)}>
                        <SelectTrigger className={`h-10 bg-white border-gray-200 hover:border-purple-300 transition-colors ${errors.role ? 'border-red-500 focus:border-red-500' : 'focus:border-purple-500'}`}>
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
                    {errors.role && <p className="text-sm text-red-500 flex items-center gap-1">
                      <XCircle className="h-4 w-4" />
                      {errors.role}
                    </p>}
                  </div>
                )}

                {user.role.toUpperCase() !== 'CEO' && (
                  <div className="space-y-2">
                    <Label htmlFor="edit-department" className="text-sm font-medium text-gray-700">Department *</Label>
                    {isLoadingDepartments ? (
                      <div className="flex items-center gap-2 p-2 border rounded-md bg-gray-50 h-10">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm text-muted-foreground">Loading departments...</span>
                      </div>
                    ) : (
                      <Select value={formData.department} onValueChange={(value) => handleInputChange('department', value)}>
                        <SelectTrigger className={`h-10 bg-white border-gray-200 hover:border-purple-300 transition-colors ${errors.department ? 'border-red-500 focus:border-red-500' : 'focus:border-purple-500'}`}>
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
                    {errors.department && <p className="text-sm text-red-500 flex items-center gap-1">
                      <XCircle className="h-4 w-4" />
                      {errors.department}
                    </p>}
                  </div>
                )}
              </div>

              {/* Role change warning */}
              {formData.role !== user.role && user.role.toUpperCase() !== 'CEO' && (
                <div className="bg-blue-50 p-3 rounded-md border border-blue-200">
                  <p className="text-sm text-blue-800">
                    <strong>Role Change Warning:</strong> Changing a user&apos;s role will affect their permissions and access levels.
                  </p>
                  <p className="text-sm text-blue-600 mt-1">
                    <strong>Current Role:</strong> {user.role.charAt(0).toUpperCase() + user.role.slice(1).replace('_', ' ')}
                  </p>
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
            </div>

            {/* Security Settings */}
            <div className="space-y-4">
              <h3 className="text-base sm:text-lg font-medium text-gray-900 border-b pb-2 flex items-center gap-2">
                <div className="w-1 h-6 bg-gradient-to-b from-orange-500 to-red-600 rounded-full"></div>
                Security Settings
              </h3>
              
              <div className="space-y-4">
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
                    className="h-4 w-4 text-orange-600 rounded border-gray-300 focus:ring-orange-500"
                  />
                  <Label htmlFor="reset-password" className="text-sm font-medium text-gray-700">
                    Reset Password
                  </Label>
                </div>

                {resetPassword && (
                  <div className="space-y-4 bg-gray-50 p-4 rounded-md border border-gray-200">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="edit-password" className="text-sm font-medium text-gray-700">New Password *</Label>
                        <div className="relative">
                          <Input
                            id="edit-password"
                            type={showPassword ? "text" : "password"}
                            value={formData.password}
                            onChange={(e) => handleInputChange('password', e.target.value)}
                            placeholder="Enter new password"
                            className={`h-10 pr-10 bg-white border-gray-200 hover:border-orange-300 transition-colors ${errors.password ? 'border-red-500 focus:border-red-500' : 'focus:border-orange-500'}`}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                        {errors.password && <p className="text-sm text-red-500 flex items-center gap-1">
                          <XCircle className="h-4 w-4" />
                          {errors.password}
                        </p>}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="edit-confirm-password" className="text-sm font-medium text-gray-700">Confirm New Password *</Label>
                        <div className="relative">
                          <Input
                            id="edit-confirm-password"
                            type={showConfirmPassword ? "text" : "password"}
                            value={formData.confirmPassword}
                            onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                            placeholder="Confirm new password"
                            className={`h-10 pr-10 bg-white border-gray-200 hover:border-orange-300 transition-colors ${errors.confirmPassword ? 'border-red-500 focus:border-red-500' : 'focus:border-orange-500'}`}
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                          >
                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                        {errors.confirmPassword && <p className="text-sm text-red-500 flex items-center gap-1">
                          <XCircle className="h-4 w-4" />
                          {errors.confirmPassword}
                        </p>}
                      </div>
                    </div>

                    {formData.password && formData.confirmPassword && (
                      <div className={`flex items-center gap-2 text-sm ${formData.password === formData.confirmPassword ? 'text-green-600' : 'text-red-600'}`}>
                        {formData.password === formData.confirmPassword ? (
                          <>
                            <CheckCircle2 className="h-4 w-4" />
                            <span>Passwords match</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="h-4 w-4" />
                            <span>Passwords do not match</span>
                          </>
                        )}
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
            </div>

            {errors.submit && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600 flex items-center gap-2">
                  <XCircle className="h-5 w-5" />
                  {errors.submit}
                </p>
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-100">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  resetForm();
                  handleDialogClose(false);
                }}
                disabled={isSubmitting}
                className="px-6 h-10"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="px-6 h-10 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Update User
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
