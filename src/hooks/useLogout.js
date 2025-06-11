import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { logout } from '../slices/auth/authSlice';

/**
 * Custom hook for logout functionality
 * Provides a simple logout function that can be used anywhere in the app
 * Clears all authentication data and redirects to login
 */
export const useLogout = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleLogout = (showToast = true) => {
        // Clear all authentication data (employeeId, employeeData, roleData, roleId)
        dispatch(logout());
        
        // Show success message
        if (showToast) {
            toast.success('Logged out successfully');
        }
        
        // Redirect to login page
        navigate('/');
    };

    return { logout: handleLogout };
};

export default useLogout;