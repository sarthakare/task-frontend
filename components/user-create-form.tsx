"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Plus, Eye, EyeOff, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";

interface Supervisor {
  id: number;
  name: string;
  email: string;
  role: string;
  department: string;
}

interface UserCreateFormProps {
  trigger?: React.ReactNode;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Password strength checker
const checkPasswordStrength = (password: string) => {
  let score = 0;
  const feedback: string[] = [];

  if (password.length >= 8) score += 1;
  else feedback.push("At least 8 characters");

  if (/[a-z]/.test(password)) score += 1;
  else feedback.push("Lowercase letter");

  if (/[A-Z]/.test(password)) score += 1;
  else feedback.push("Uppercase letter");

  if (/[0-9]/.test(password)) score += 1;
  else feedback.push("Number");

  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  else feedback.push("Special character");

  let strength = "weak";
  let color = "bg-red-500";
  
  if (score >= 4) {
    strength = "strong";
    color = "bg-green-500";
  } else if (score >= 3) {
    strength = "medium";
    color = "bg-yellow-500";
  } else if (score >= 2) {
    strength = "fair";
    color = "bg-orange-500";
  }

  return { score, strength, color, feedback, percentage: (score / 5) * 100 };
};

export function UserCreateForm({ trigger }: UserCreateFormProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [supervisors, setSupervisors] = useState<Supervisor[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [roles, setRoles] = useState<string[]>([]);
  const [isLoadingSupervisors, setIsLoadingSupervisors] = useState(false);
  const [isLoadingDepartments, setIsLoadingDepartments] = useState(false);
  const [isLoadingRoles, setIsLoadingRoles] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: '',
    role: '',
    supervisor: '',
    mobile: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Password strength state
  const passwordStrength = checkPasswordStrength(formData.password);
  const passwordsMatch = formData.password && formData.confirmPassword && formData.password === formData.confirmPassword;

  // Fetch data when component mounts or dialog opens
  useEffect(() => {
    if (isCreateDialogOpen) {
      fetchSupervisors();
      fetchDepartments();
      fetchRoles();
    }
  }, [isCreateDialogOpen]);

  const fetchSupervisors = async () => {
    setIsLoadingSupervisors(true);
    try {
      const response = await fetch(`${API_BASE_URL}/users/`);
      if (!response.ok) {
        throw new Error(`Failed to fetch users: ${response.status}`);
      }
      const data = await response.json();
      setSupervisors(data);
    } catch (error) {
      console.error('Error fetching users:', error);
      // Fallback to empty array if API fails
      setSupervisors([]);
    } finally {
      setIsLoadingSupervisors(false);
    }
  };

  const fetchDepartments = async () => {
    setIsLoadingDepartments(true);
    try {
      const response = await fetch(`${API_BASE_URL}/users/departments/`);
      if (!response.ok) {
        throw new Error(`Failed to fetch departments: ${response.status}`);
      }
      const data = await response.json();
      setDepartments(data);
    } catch (error) {
      console.error('Error fetching departments:', error);
      // Fallback to default departments if API fails
      setDepartments(['engineering', 'marketing', 'sales', 'hr', 'finance', 'operations', 'it']);
    } finally {
      setIsLoadingDepartments(false);
    }
  };

  const fetchRoles = async () => {
    setIsLoadingRoles(true);
    try {
      const response = await fetch(`${API_BASE_URL}/users/roles/`);
      if (!response.ok) {
        throw new Error(`Failed to fetch roles: ${response.status}`);
      }
      const data = await response.json();
      setRoles(data);
    } catch (error) {
      console.error('Error fetching roles:', error);
      // Fallback to default roles if API fails
      setRoles(['admin', 'manager', 'supervisor', 'team_lead', 'member', 'intern']);
    } finally {
      setIsLoadingRoles(false);
    }
  };

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

    if (!formData.supervisor) {
      newErrors.supervisor = 'Supervisor is required';
    }

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
      // Prepare data for API (convert supervisor string to number)
      const userData = {
        name: formData.name,
        email: formData.email,
        mobile: formData.mobile,
        password: formData.password,
        department: formData.department,
        role: formData.role,
        supervisor_id: formData.supervisor ? parseInt(formData.supervisor) : null
      };

      const response = await fetch(`${API_BASE_URL}/users/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to create user');
      }

      const createdUser = await response.json();
      console.log('User created successfully:', createdUser);
      
      // Reset form and close dialog
      resetForm();
      setIsCreateDialogOpen(false);
      
      // Show success toast
      toast.success('User created successfully!', {
        description: `${formData.name} has been added to the system.`,
        duration: 4000,
      });
      
    } catch (error) {
      console.error('Error creating user:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create user';
      setErrors({ submit: errorMessage });
      
      // Show error toast
      toast.error('Failed to create user', {
        description: errorMessage,
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      department: '',
      role: '',
      supervisor: '',
      mobile: '',
      password: '',
      confirmPassword: ''
    });
    setErrors({});
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const defaultTrigger = (
    <Button onClick={() => setIsCreateDialogOpen(true)}>
      <Plus className="h-4 w-4 mr-2" />
      Add User
    </Button>
  );

  return (
    <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-hidden">
        <DialogHeader className="pb-4 border-b">
          <DialogTitle className="text-xl font-semibold text-gray-900">Create New User</DialogTitle>
        </DialogHeader>
        
        <div className="overflow-y-auto max-h-[calc(80vh-120px)] pr-2">
          <form onSubmit={handleSubmit} className="space-y-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium text-gray-700">Full Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter full name"
                  className={`transition-colors ${errors.name ? 'border-red-500 focus:border-red-500' : 'focus:border-blue-500'}`}
                />
                {errors.name && <p className="text-sm text-red-500 flex items-center gap-1">
                  <XCircle className="h-4 w-4" />
                  {errors.name}
                </p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Enter email address"
                  className={`transition-colors ${errors.email ? 'border-red-500 focus:border-red-500' : 'focus:border-blue-500'}`}
                />
                {errors.email && <p className="text-sm text-red-500 flex items-center gap-1">
                  <XCircle className="h-4 w-4" />
                  {errors.email}
                </p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="mobile" className="text-sm font-medium text-gray-700">Mobile Number</Label>
                <Input
                  id="mobile"
                  type="tel"
                  value={formData.mobile}
                  onChange={(e) => handleInputChange('mobile', e.target.value)}
                  placeholder="Enter mobile number"
                  className={`transition-colors ${errors.mobile ? 'border-red-500 focus:border-red-500' : 'focus:border-blue-500'}`}
                />
                {errors.mobile && <p className="text-sm text-red-500 flex items-center gap-1">
                  <XCircle className="h-4 w-4" />
                  {errors.mobile}
                </p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="department" className="text-sm font-medium text-gray-700">Department</Label>
                <Select value={formData.department} onValueChange={(value) => handleInputChange('department', value)}>
                  <SelectTrigger className={`transition-colors ${errors.department ? 'border-red-500 focus:border-red-500' : 'focus:border-blue-500'}`}>
                    <SelectValue placeholder={isLoadingDepartments ? "Loading..." : "Select department"} />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept.charAt(0).toUpperCase() + dept.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.department && <p className="text-sm text-red-500 flex items-center gap-1">
                  <XCircle className="h-4 w-4" />
                  {errors.department}
                </p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="role" className="text-sm font-medium text-gray-700">Role/Designation</Label>
                <Select value={formData.role} onValueChange={(value) => handleInputChange('role', value)}>
                  <SelectTrigger className={`transition-colors ${errors.role ? 'border-red-500 focus:border-red-500' : 'focus:border-blue-500'}`}>
                    <SelectValue placeholder={isLoadingRoles ? "Loading..." : "Select role"} />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role} value={role}>
                        {role.charAt(0).toUpperCase() + role.replace('_', ' ').slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.role && <p className="text-sm text-red-500 flex items-center gap-1">
                  <XCircle className="h-4 w-4" />
                  {errors.role}
                </p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="supervisor" className="text-sm font-medium text-gray-700">Supervisor/Manager</Label>
              <Select value={formData.supervisor} onValueChange={(value) => handleInputChange('supervisor', value)}>
                <SelectTrigger className={`transition-colors ${errors.supervisor ? 'border-red-500 focus:border-red-500' : 'focus:border-blue-500'}`}>
                  <SelectValue placeholder={isLoadingSupervisors ? "Loading..." : "Select supervisor/manager"} />
                </SelectTrigger>
                <SelectContent>
                  {supervisors.map((supervisor) => (
                    <SelectItem key={supervisor.id} value={supervisor.id.toString()}>
                      <div className="flex flex-col">
                        <span className="font-medium">{supervisor.name}</span>
                        <span className="text-sm text-gray-500">{supervisor.role} • {supervisor.department}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.supervisor && <p className="text-sm text-red-500 flex items-center gap-1">
                <XCircle className="h-4 w-4" />
                {errors.supervisor}
              </p>}
              {supervisors.length === 0 && !isLoadingSupervisors && (
                <p className="text-sm text-yellow-600 bg-yellow-50 p-3 rounded-md border border-yellow-200">
                  No users available. Please create some users first.
                </p>
              )}
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    placeholder="Enter password"
                    className={`pr-10 transition-colors ${errors.password ? 'border-red-500 focus:border-red-500' : 'focus:border-blue-500'}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                
                {/* Password Strength Meter */}
                {formData.password && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Password strength:</span>
                      <span className={`font-medium ${
                        passwordStrength.strength === 'strong' ? 'text-green-600' :
                        passwordStrength.strength === 'medium' ? 'text-yellow-600' :
                        passwordStrength.strength === 'fair' ? 'text-orange-600' : 'text-red-600'
                      }`}>
                        {passwordStrength.strength.charAt(0).toUpperCase() + passwordStrength.strength.slice(1)}
                      </span>
                    </div>
                    <Progress value={passwordStrength.percentage} className="h-2" />
                    <div className="flex flex-wrap gap-2">
                      {passwordStrength.feedback.map((item, index) => (
                        <span key={index} className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {errors.password && <p className="text-sm text-red-500 flex items-center gap-1">
                  <XCircle className="h-4 w-4" />
                  {errors.password}
                </p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    placeholder="Confirm password"
                    className={`transition-colors ${errors.confirmPassword ? 'border-red-500 focus:border-red-500' : 'focus:border-blue-500'}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                
                {/* Password Match Indicator */}
                {formData.confirmPassword && (
                  <div className={`flex items-center gap-2 text-sm ${
                    passwordsMatch ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {passwordsMatch ? (
                      <>
                        <CheckCircle className="h-4 w-4" />
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
                
                {errors.confirmPassword && <p className="text-sm text-red-500 flex items-center gap-1">
                  <XCircle className="h-4 w-4" />
                  {errors.confirmPassword}
                </p>}
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

            <div className="flex justify-end space-x-3 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  resetForm();
                  setIsCreateDialogOpen(false);
                }}
                disabled={isSubmitting}
                className="px-6"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting || !passwordsMatch}
                className="px-6 bg-blue-600 hover:bg-blue-700"
              >
                {isSubmitting ? 'Creating...' : 'Create User'}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
