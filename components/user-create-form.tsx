"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Plus, Eye, EyeOff, CheckCircle, XCircle, CheckCircle2, CircleAlert, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api-service";

interface Supervisor {
  id: number;
  name: string;
  email: string;
  role: string;
  department: string;
}

interface UserCreateFormProps {
  trigger?: React.ReactNode;
  onUserCreated?: () => void;
}

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

export function UserCreateForm({ trigger, onUserCreated }: UserCreateFormProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [supervisors, setSupervisors] = useState<Supervisor[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [roles, setRoles] = useState<string[]>([]);
  const [currentUser, setCurrentUser] = useState<{id: number, role: string} | null>(null);
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
      fetchCurrentUser();
      fetchSupervisors();
      fetchDepartments();
      fetchRoles();
    }
  }, [isCreateDialogOpen]);

  const fetchCurrentUser = async () => {
    try {
      const user = await api.users.getCurrentUser();
      setCurrentUser(user);
    } catch (error) {
      console.error('Error fetching current user:', error);
    }
  };

  const fetchSupervisors = async () => {
    setIsLoadingSupervisors(true);
    try {
      const data = await api.users.getAllUsers();
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

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => {
      const newData = {
        ...prev,
        [field]: value
      };

      // Auto-set department to "All" when CEO role is selected by admin
      if (field === 'role' && value === 'CEO' && currentUser?.role?.toUpperCase() === 'ADMIN') {
        newData.department = 'All';
      }

      return newData;
    });

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

    // Supervisor is optional for CEO role when created by admin
    if (!formData.supervisor && !(formData.role === 'CEO' && currentUser?.role?.toUpperCase() === 'ADMIN')) {
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
        supervisor_id: formData.supervisor ? parseInt(formData.supervisor) : undefined
      };

      const createdUser = await api.users.createUser(userData);
      console.log('User created successfully:', createdUser);

      // Reset form and close dialog
      resetForm();
      setIsCreateDialogOpen(false);

      // Show success toast
      toast.success('User created successfully!', {
        description: `${formData.name} has been added to the system.`,
        icon: <CheckCircle2 className="text-green-600" />,
        style: { color: "green" },
      });

      // Call callback to refresh parent component
      if (onUserCreated) {
        onUserCreated();
      }

    } catch (error) {
      console.error('Error creating user:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create user';
      setErrors({ submit: errorMessage });

      // Show error toast
      toast.error('Failed to create user', {
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
    <button 
      onClick={() => setIsCreateDialogOpen(true)} 
      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 cursor-pointer"
    >
      <Plus className="h-4 w-4" />
      <span>Add User</span>
    </button>
  );

  return (
    <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="min-w-[80vw] min-h-[80vh] overflow-hidden bg-white dark:bg-gray-900">
        <DialogHeader className="pb-6 border-b border-gray-200 dark:border-gray-800">
          <DialogTitle className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2 sm:gap-3">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <Plus className="h-5 w-5 text-blue-500" />
            </div>
            Create New User
          </DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-400 mt-2">
            Fill out the form below to create a new user account with all necessary details and permissions.
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[calc(80vh-120px)] pr-2">
          <form onSubmit={handleSubmit} className="space-y-6 py-4">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-800 pb-2 flex items-center gap-2">
                <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
                Basic Information
              </h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-gray-300">Full Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter full name"
                    className={`h-10 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors ${errors.name ? 'border-red-500 focus:border-red-500' : 'focus:border-blue-500'}`}
                  />
                  {errors.name && <p className="text-sm text-red-500 dark:text-red-400 flex items-center gap-1">
                    <XCircle className="h-4 w-4" />
                    {errors.name}
                  </p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="Enter email address"
                    className={`h-10 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors ${errors.email ? 'border-red-500 focus:border-red-500' : 'focus:border-blue-500'}`}
                  />
                  {errors.email && <p className="text-sm text-red-500 dark:text-red-400 flex items-center gap-1">
                    <XCircle className="h-4 w-4" />
                    {errors.email}
                  </p>}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="mobile" className="text-sm font-medium text-gray-700 dark:text-gray-300">Mobile Number *</Label>
                  <Input
                    id="mobile"
                    type="tel"
                    value={formData.mobile}
                    onChange={(e) => handleInputChange('mobile', e.target.value)}
                    placeholder="Enter mobile number"
                    className={`h-10 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors ${errors.mobile ? 'border-red-500 focus:border-red-500' : 'focus:border-blue-500'}`}
                  />
                  {errors.mobile && <p className="text-sm text-red-500 dark:text-red-400 flex items-center gap-1">
                    <XCircle className="h-4 w-4" />
                    {errors.mobile}
                  </p>}
                </div>
              </div>
            </div>

            {/* Role & Department */}
            <div className="space-y-4">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-800 pb-2 flex items-center gap-2">
                <div className="w-1 h-6 bg-purple-500 rounded-full"></div>
                Role & Department
              </h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="role" className="text-sm font-medium text-gray-700 dark:text-gray-300">Role/Designation *</Label>
                  <Select value={formData.role} onValueChange={(value) => handleInputChange('role', value)}>
                    <SelectTrigger className={`h-10 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors ${errors.role ? 'border-red-500 focus:border-red-500' : 'focus:border-blue-500'}`}>
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
                  {currentUser?.role?.toUpperCase() === 'ADMIN' && roles.includes('CEO') && (
                    <p className="text-sm text-green-700 dark:text-green-500 bg-green-50 dark:bg-green-900/20 p-2 rounded-md border border-green-200 dark:border-green-800">
                      As admin, you can create CEO users. CEO will have access to all departments.
                    </p>
                  )}
                  {errors.role && <p className="text-sm text-red-500 dark:text-red-400 flex items-center gap-1">
                    <XCircle className="h-4 w-4" />
                    {errors.role}
                  </p>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="department" className="text-sm font-medium text-gray-700 dark:text-gray-300">Department *</Label>
                  <Select 
                    value={formData.department} 
                    onValueChange={(value) => handleInputChange('department', value)}
                    disabled={formData.role === 'CEO'}
                  >
                    <SelectTrigger className={`h-10 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors ${errors.department ? 'border-red-500 focus:border-red-500' : 'focus:border-blue-500'} ${formData.role === 'CEO' ? 'bg-gray-100 dark:bg-gray-700' : ''}`}>
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
                  {formData.role === 'CEO' && (
                    <p className="text-sm text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 p-2 rounded-md border border-blue-200 dark:border-blue-800">
                      CEO role automatically gets &quot;All&quot; departments access
                    </p>
                  )}
                  {errors.department && <p className="text-sm text-red-500 dark:text-red-400 flex items-center gap-1">
                    <XCircle className="h-4 w-4" />
                    {errors.department}
                  </p>}
                </div>
              </div>
            </div>

            {/* Supervisor Assignment */}
            <div className="space-y-4">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-800 pb-2 flex items-center gap-2">
                <div className="w-1 h-6 bg-green-500 rounded-full"></div>
                Supervisor Assignment
              </h3>
              
              <div className="space-y-2">
                <Label htmlFor="supervisor" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Supervisor {formData.role === 'CEO' && currentUser?.role?.toUpperCase() === 'ADMIN' && '(Optional for CEO)'}
                </Label>
                <Select value={formData.supervisor} onValueChange={(value) => handleInputChange('supervisor', value)}>
                  <SelectTrigger className={`h-10 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors ${errors.supervisor ? 'border-red-500 focus:border-red-500' : 'focus:border-blue-500'}`}>
                    <SelectValue placeholder={isLoadingSupervisors ? "Loading..." : "Select supervisor/manager"} />
                  </SelectTrigger>
                  <SelectContent>
                    {supervisors.map((supervisor) => (
                      <SelectItem key={supervisor.id} value={supervisor.id.toString()}>
                        <div className="flex">
                          <span className="font-medium">{supervisor.name} <span className="text-sm text-gray-500">({supervisor.role} • {supervisor.department})</span> </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formData.role === 'CEO' && currentUser?.role?.toUpperCase() === 'ADMIN' && (
                  <p className="text-sm text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 p-2 rounded-md border border-blue-200 dark:border-blue-800">
                    CEO users typically don&apos;t have a supervisor. You can leave this blank.
                  </p>
                )}
                {errors.supervisor && <p className="text-sm text-red-500 dark:text-red-400 flex items-center gap-1">
                  <XCircle className="h-4 w-4" />
                  {errors.supervisor}
                </p>}
                {supervisors.length === 0 && !isLoadingSupervisors && (
                  <p className="text-sm text-yellow-700 dark:text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-md border border-yellow-200 dark:border-yellow-800">
                    No users available. Please create some users first.
                  </p>
                )}
              </div>
            </div>

            {/* Security Settings */}
            <div className="space-y-4">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-800 pb-2 flex items-center gap-2">
                <div className="w-1 h-6 bg-orange-500 rounded-full"></div>
                Security Settings
              </h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">Password *</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      placeholder="Enter password"
                      className={`h-10 pr-10 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors ${errors.password ? 'border-red-500 focus:border-red-500' : 'focus:border-blue-500'}`}
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
                        <span className={`font-medium ${passwordStrength.strength === 'strong' ? 'text-green-600' :
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
                  <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700 dark:text-gray-300">Confirm Password *</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      placeholder="Confirm password"
                      className={`h-10 pr-10 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors ${errors.confirmPassword ? 'border-red-500 focus:border-red-500' : 'focus:border-blue-500'}`}
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
                    <div className={`flex items-center gap-2 text-sm ${passwordsMatch ? 'text-green-600' : 'text-red-600'
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
            </div>

            {errors.submit && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                  <XCircle className="h-5 w-5" />
                  {errors.submit}
                </p>
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-800">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  resetForm();
                  setIsCreateDialogOpen(false);
                }}
                disabled={isSubmitting}
                className="px-6 h-10 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !passwordsMatch}
                className="px-6 h-10 bg-blue-500 hover:bg-blue-600 text-white font-medium transition-colors"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Create User
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
